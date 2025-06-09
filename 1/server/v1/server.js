const fs = require('fs');
const path = require('path');
const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const cors = require('cors');

const app = express();
const PORT = 1337;

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ limit: '1mb', extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const usersFile = path.join(__dirname, 'users.json');
if (!fs.existsSync(usersFile)) {
  fs.writeFileSync(usersFile, JSON.stringify({}));
}

const requestDir = path.join(__dirname, 'requests');
if (!fs.existsSync(requestDir)) {
  fs.mkdirSync(requestDir);
}

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const updateUserStatus = (id, status) => {
  const users = JSON.parse(fs.readFileSync(usersFile, 'utf-8'));
  users[id] = { status, lastOnline: new Date().toISOString() };
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
};

const getAllUsers = () => JSON.parse(fs.readFileSync(usersFile, 'utf-8'));

const saveRequest = (toId, data) => {
  const filePath = path.join(requestDir, `${toId}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

const fetchRequests = (id) => {
  const filePath = path.join(requestDir, `${id}.json`);
  if (fs.existsSync(filePath)) {
    const requests = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    fs.unlinkSync(filePath);
    return requests;
  }
  return null;
};

const clients = new Map();

wss.on('connection', (ws) => {
  let clientId;

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      if (!clientId) {
        clientId = message.id;
        clients.set(clientId, ws);
        updateUserStatus(clientId, 'online');
        const pendingRequests = fetchRequests(clientId);
        if (pendingRequests) {
          ws.send(JSON.stringify({ type: 'pendingRequests', data: pendingRequests }));
        }
        return;
      }

      if (message.to && message.type && message.message) {
        const timestamp = new Date().toISOString();
        const toClient = clients.get(message.to);

        if (toClient) {
          toClient.send(JSON.stringify({ from: clientId, type: message.type, message: message.message, timestamp }));
        } else {
          const users = getAllUsers();
          const lastOnline = users[message.to]?.lastOnline || 'unknown';
          ws.send(JSON.stringify({ type: 'offlineNotification', message: `The user is offline. Last seen: ${lastOnline}` }));
          saveRequest(message.to, { from: clientId, type: message.type, message: message.message, timestamp });
        }
      }
    } catch (err) {
      console.error('Error processing message:', err);
    }
  });

  ws.on('close', () => {
    if (clientId) {
      updateUserStatus(clientId, 'offline');
      clients.delete(clientId);
    }
  });
});

app.get('/allusers', (req, res) => {
  res.json(getAllUsers());
});

server.listen(PORT, () => {
  console.log(`HTTP server running on http://localhost:${PORT}`);
  console.log(`WebSocket server running on ws://localhost:${PORT}`);
});
