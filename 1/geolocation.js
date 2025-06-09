// geolocation.js
// This file obtains location data and sends it to background via chrome.runtime.sendMessage.
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(function(position) {
    const info = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    };
    document.getElementById("locationInfo").textContent =
      "緯度: " + info.latitude + "、経度: " + info.longitude;
    // Send geolocation data to background
    chrome.runtime.sendMessage({ type: "geoInfo", data: info });
    // Close the window after a short delay
    setTimeout(() => {
      window.close();
    }, 500);
  }, function(error) {
    document.getElementById("locationInfo").textContent = "位置情報取得エラー: " + error.message;
  });
} else {
  document.getElementById("locationInfo").textContent = "このブラウザでは位置情報取得に対応していません。";
}