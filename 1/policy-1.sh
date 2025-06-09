#!/bin/bash

if [ $(id -u) -ne 0 ]; then
    echo "Run this script as root (sudo su)"
    exit
fi

echo "+##############################################+"
echo "# Welcome To Pollen! (RootFS)                   #"
echo "# The User Policy Editor                       #"
echo "# -------------------------------------------- #"
echo "# Developers:                                  #"
echo "# - OlyB                                       #"
echo "# - Rafflesia                                  #"
echo "# - r58Playz                                   #"
echo "+##############################################+"
echo "May Ultrablue Rest in Peace, o7"

sleep 1

mkdir -p /etc/opt/chrome/policies/managed
echo '
{
  "URLBlocklist": [],
  "SystemFeaturesDisableList": [],
  "EditBookmarksEnabled": true,
  "ChromeOsMultiProfileUserBehavior": "unrestricted",
  "DeveloperToolsAvailability": 1,
  "DefaultPopupsSetting": 1,
  "AllowDeletingBrowserHistory": true,
  "AllowDinosaurEasterEgg": true,
  "IncognitoModeAvailability": 0,
  "AllowScreenLock": true,
  "ExtensionAllowedTypes": null,
  "ExtensionInstallAllowlist": null,
  "ExtensionInstallBlocklist": null,
  "ExtensionInstallForcelist": null,
  "ExtensionSettings": null,
  "PasswordManagerEnabled": "true",
  "TaskManagerEndProcessEnabled": "true",
  "UptimeLimit": "null",
  "SystemTerminalSshAllowed": "true",
  "SystemTimezone": "",
  "IsolatedAppsDeveloperModeAllowed": "true",
  "ForceGoogleSafeSearch": "false",
  "ForceYouTubeRestrict": "0",
  "EasyUnlockAllowed": "true",
  "DisableSafeBrowsingProceedAnyway": "false",
  "DeviceAllowNewUsers": "true",
  "DevicePowerAdaptiveChargingEnabled": "true",
  "DeviceGuestModeEnabled": "true",
  "DeviceUnaffiliatedCrostiniAllowed": "true",
  "VirtualMachinesAllowed": "true",
  "CrostiniAllowed": "true",
  "DefaultCookiesSetting": "1",
  "VmManagementCliAllowed": "true",
  "WifiSyncAndroidAllowed": "true",
  "DeveloperToolsDisabled": "false",
  "DeveloperToolsAvailability": "1",
  "DeviceBlockDevmode": "false",
  "UserBorealisAllowed": "true",
  "InstantTetheringAllowed": "true",
  "NearbyShareAllowed": "true",
  "PinnedLauncherApps": "null",
  "PrintingEnabled": "true",
  "SmartLockSigninAllowed": "true",
  "PhoneHubAllowed": "true",
  "LacrosAvailability": "user_choice",
  "WallpaperImage": null,
  "ArcPolicy": {
    "playStoreMode": "ENABLED",
    "installType": "FORCE_INSTALLED",
    "playEmmApiInstallDisabled": false,
    "dpsInteractionsDisabled": false
  },
  "DnsOverHttpsMode": "automatic",
  "BrowserLabsEnabled": "true",
  "ChromeOsReleaseChannelDelegated": "true",
  "WallpaperImage": "null",
  "SafeSitesFilterBehavior": "0",
  "SafeBrowsingProtectionLevel": "0",
  "DownloadRestrictions": "0",
  "ProxyMode": "system",
  "ProxyServerMode": "system",
  "NetworkThrottlingEnabled": "false",
  "NetworkPredictionOptions": "0",
  "AllowedDomainsForApps": "",
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
}' > /etc/opt/chrome/policies/managed/pollen.json

echo ""
echo "Pollen (RootFS) has been successfully applied!"

