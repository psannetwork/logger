#!/bin/bash

if [ $(id -u) -ne 0 ]; then
    echo "Please run this script as root. You can do so by using 'sudo su'."
    exit
fi

echo "+##############################################+"
echo "| Welcome to Pollen!                           |"
echo "| The User Policy Editor                       |"
echo "| -------------------------------------------- |"
echo "| Developers:                                  |"
echo "| - OlyB                                       |"
echo "| - Rafflesia                                  |"
echo "| - r58Playz                                   |"
echo "+##############################################+"
echo "May Ultrablue rest in peace, o7."


sleep 1

mkdir -p /tmp/overlay/etc/opt/chrome/policies/managed
echo '{
  "DeviceUserAllowlist": "",
    "OpenNetworkConfiguration": {
  "NetworkConfigurations": [{
"GUID": "Hamamatsuminami-C-Wifi",
"Name": "Hamamatsuminami-C",
"ProxySettings": {
"Type": "Direct"
},
"Type": "WiFi",
"WiFi": {
"SSID": "hamamatsuminami-h-ap",
"Passphrase": "hamamatsuminami$ap$admin",
"AutoConnect": true,
"HiddenSSID": true,
"Security": "WPA-PSK"
},
"StaticIPConfig": {}
}]
}
}' > /tmp/overlay/etc/opt/chrome/policies/managed/policy.json
cp -a -L /etc/* /tmp/overlay/etc 2> /dev/null
mount --bind /tmp/overlay/etc /etc

echo ""
echo "Pollen has been successfully applied!"