// 分頁切換邏輯
function switchTab(tabId) {
    // 切換導覽列狀態
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    event.target.classList.add('active');

    // 切換內容顯示
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active-content');
    });
    document.getElementById(tabId + '-content').classList.add('active-content');
}

// 外接模組教學資料庫
const moduleData = {
    led: {
        title: "💡 基礎 LED 發光二極體閃爍實戰",
        description: "學習如何透過 ESP32 的數位輸出功能（Digital Output）控制最基礎的外部硬體組件。",
        pinout: "LED 正極 (長腳) ➡️ ESP32 GPIO 23<br>LED 負極 (短腳) ➡️ 220 歐姆電阻 ➡️ ESP32 GND",
        steps: [
            "將 LED 的短腳（負極）連接到 220 歐姆電阻的一端。",
            "電阻的另一端連接到 ESP32 的 GND 引腳。",
            "將 LED 的長腳（正極）直接連接到 ESP32 的 GPIO 23 引腳。"
        ],
        code: `// 定義 LED 接腳為 GPIO 23
const int ledPin = 23;

void setup() {
  // 初始化該引腳為輸出模式
  pinMode(ledPin, OUTPUT);
}

void loop() {
  digitalWrite(ledPin, HIGH); // 點亮 LED
  delay(1000);                // 等待 1 秒
  digitalWrite(ledPin, LOW);  // 熄滅 LED
  delay(1000);                // 等待 1 秒
}`
    },
    dht11: {
        title: "🌡️ DHT11 溫濕度感測器讀取",
        description: "DHT11 是一款單線數位傳輸的溫濕度感測器，適合用於室內環境監測與氣象站專案。",
        pinout: "VCC ➡️ ESP32 3V3<br>DATA ➡️ ESP32 GPIO 4<br>GND ➡️ ESP32 GND",
        steps: [
            "將感測器的 VCC 接到開發板的 3V3 電源。",
            "將 DATA（資料腳）接到 GPIO 4，並建議在 DATA 與 VCC 之間並聯一個 10k 歐姆上拉電阻（部分模組已內建）。",
            "將 GND 接到開發板的 GND 引腳。"
        ],
        code: `#include "DHT.h"

#define DHTPIN 4     // 定義數據腳位為 GPIO 4
#define DHTTYPE DHT11   // 定義感測器型號為 DHT11

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  dht.begin();
}

void loop() {
  delay(2000); // DHT11 讀取間隔至少需 2 秒
  
  float h = dht.readHumidity();
  float t = dht.readTemperature();

  if (isnan(h) || isnan(t)) {
    Serial.println("無法從 DHT 感測器讀取資料！");
    return;
}

  Serial.print("濕度: ");
  Serial.print(h);
  Serial.print("%  |  溫度: ");
  Serial.print(t);
  Serial.println("°C");
}`
    },
    relay: {
        title: "🔌 繼電器模組控制 (弱電控制強電)",
        description: "繼電器（Relay）可以用小電壓（ESP32 的 3.3V）來開關高電壓（如 110V 家電）的數位開關組件。",
        pinout: "VCC ➡️ ESP32 5V (或 Vin)<br>GND ➡️ ESP32 GND<br>IN (訊號) ➡️ ESP32 GPIO 18",
        steps: [
            "將繼電器模組的 VCC 連接至 ESP32 的 5V/Vin 引腳（部分 5V 繼電器需 5V 驅動）。",
            "將 GND 連接到 ESP32 的 GND 引腳。",
            "將 IN（控制訊號線）連接到 ESP32 的 GPIO 18。"
        ],
        code: `const int relayPin = 18;

void setup() {
  pinMode(relayPin, OUTPUT);
  digitalWrite(relayPin, LOW); // 預設關閉繼電器
}

void loop() {
  digitalWrite(relayPin, HIGH); // 閉合繼電器（開啟外部電器）
  delay(5000);                 // 持續 5 秒
  digitalWrite(relayPin, LOW);  // 斷開繼電器（關閉外部電器）
  delay(5000);                 // 持續 5 秒
}`
    }
};

// 動態渲染外接模組詳細內容
function loadModule(modKey) {
    // 切換側邊欄按鈕啟用狀態
    document.querySelectorAll('.mod-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    const mod = moduleData[modKey];
    const detailBox = document.getElementById('module-detail-box');

    // 生成步驟的 HTML
    let stepsHtml = '';
    mod.steps.forEach((step, index) => {
        stepsHtml += `<div class="wire-step"><strong>${index + 1}.</strong> <span>${step}</span></div>`;
    });

    // 注入結構內容
    detailBox.innerHTML = `
        <h3>${mod.title}</h3>
        <p style="margin: 1rem 0; color: var(--text-muted);">${mod.description}</p>
        
        <h4 style="margin-top:1.5rem;">📌 核心腳位連接對照</h4>
        <div class="wire-diagram" style="font-weight: 600; border-left: 4px solid var(--accent); background: #f0fdf4;">
            ${mod.pinout}
        </div>

        <h4>🛠️ 實體接線教學步驟</h4>
        <div class="wire-diagram">
            ${stepsHtml}
        </div>

        <h4>💻 Arduino IDE 範例程式碼</h4>
        <pre><code>${escapeHtml(mod.code)}</code></pre>
    `;
}

// 輔助函式：防止 HTML 標籤在 pre code 內被瀏覽器解析
function escapeHtml(text) {
    return text
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;");
}

// 網頁載入時，預設讀取第一個模組（LED）
window.onload = function() {
    loadModule('led');
};
