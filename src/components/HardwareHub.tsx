import React, { useState } from 'react';
import {
  Cpu,
  Copy,
  Check,
  Download,
  Terminal,
  GitBranch,
  Send,
  Zap,
  Layers,
  ArrowRight,
} from 'lucide-react';

export const HardwareHub: React.FC = () => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedGit, setCopiedGit] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);

  // REST API Tester State
  const [apiShedId, setApiShedId] = useState('shed-1');
  const [apiTemp, setApiTemp] = useState('29.2');
  const [apiHum, setApiHum] = useState('62.5');
  const [apiNh3, setApiNh3] = useState('16.4');
  const [apiResponse, setApiResponse] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const handleCopyCode = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleTestApi = async () => {
    setIsSending(true);
    try {
      const res = await fetch('/api/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shedId: apiShedId,
          temperature: parseFloat(apiTemp),
          humidity: parseFloat(apiHum),
          ammonia: parseFloat(apiNh3),
        }),
      });
      const data = await res.json();
      setApiResponse(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setApiResponse(JSON.stringify({ error: err.message }, null, 2));
    } finally {
      setIsSending(false);
    }
  };

  const arduinoSketch = `/*
 * Smart Poultry Farm IoT Environmental Monitor
 * Platform: ESP32-WROOM-32
 * Sensors: DHT22 (Temp & RH), MQ-135 (NH3 / Air Quality), SSD1306 OLED (I2C)
 * Actuators: 4-Channel 5V Relay Module (Fans, Cooling Pads, Heaters)
 * Institution: KIT – Kalaignarkarunanidhi Institute of Technology (CSE)
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <ArduinoJson.h>

// --- Wi-Fi Credentials ---
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// --- Cloud Server Telemetry API ---
const char* serverUrl = "http://YOUR_SERVER_IP_OR_DOMAIN:3000/api/telemetry";
const char* shedId = "shed-1";

// --- Pin Definitions ---
#define DHTPIN 4          // GPIO 4 connected to DHT22 Data
#define DHTTYPE DHT22     // DHT 22 (AM2302)
#define MQ135_PIN 34      // ADC1 GPIO 34 for MQ-135 Analog Output
#define RELAY_FAN 26      // GPIO 26 -> Relay 1 (Exhaust Fan)
#define RELAY_HEATER 27   // GPIO 27 -> Relay 2 (Infrared Brooder)
#define RELAY_PUMP 14     // GPIO 14 -> Relay 3 (Cooling Pad Pump)

DHT dht(DHTPIN, DHTTYPE);
Adafruit_SSD1306 display(128, 64, &Wire, -1);

void setup() {
  Serial.begin(115200);
  pinMode(RELAY_FAN, OUTPUT);
  pinMode(RELAY_HEATER, OUTPUT);
  pinMode(RELAY_PUMP, OUTPUT);
  digitalWrite(RELAY_FAN, HIGH);    // Active LOW relay default OFF
  digitalWrite(RELAY_HEATER, HIGH);
  digitalWrite(RELAY_PUMP, HIGH);

  dht.begin();
  Wire.begin(21, 22); // SDA=21, SCL=22 for I2C OLED

  if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println(F("SSD1306 allocation failed"));
  }
  display.clearDisplay();
  display.setTextColor(WHITE);
  display.setTextSize(1);
  display.setCursor(0, 10);
  display.println("POULTRY MONITOR");
  display.println("Connecting to Wi-Fi...");
  display.display();

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi Connected! IP: " + WiFi.localIP().toString());
}

void loop() {
  float temp = dht.readTemperature();
  float hum = dht.readHumidity();
  int rawGas = analogRead(MQ135_PIN);
  float nh3_ppm = (rawGas / 4095.0) * 50.0; // Calibrated load curve

  if (isnan(temp) || isnan(hum)) {
    Serial.println("Failed to read from DHT22 sensor!");
    delay(2000);
    return;
  }

  // --- Update Local OLED ---
  display.clearDisplay();
  display.setCursor(0, 0);
  display.println("POULTRY MONITOR");
  display.print("Temp: "); display.print(temp, 1); display.println(" C");
  display.print("Hum:  "); display.print(hum, 1);  display.println(" %RH");
  display.print("NH3:  "); display.print(nh3_ppm, 1); display.println(" ppm");
  display.print("Fan: "); display.println(digitalRead(RELAY_FAN) == LOW ? "ON" : "OFF");
  display.display();

  // --- Local Edge Fail-Safe Automation ---
  if (temp > 30.0 || nh3_ppm > 20.0) {
    digitalWrite(RELAY_FAN, LOW); // Turn Fan ON
  } else if (temp < 22.0) {
    digitalWrite(RELAY_FAN, HIGH);
    digitalWrite(RELAY_HEATER, LOW); // Turn Heater ON
  } else {
    digitalWrite(RELAY_HEATER, HIGH);
  }

  // --- Stream JSON Telemetry to Cloud REST Endpoint ---
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");

    StaticJsonDocument<256> doc;
    doc["shedId"] = shedId;
    doc["temperature"] = temp;
    doc["humidity"] = hum;
    doc["ammonia"] = nh3_ppm;

    String requestBody;
    serializeJson(doc, requestBody);

    int httpCode = http.POST(requestBody);
    if (httpCode > 0) {
      String response = http.getString();
      Serial.println("Telemetry dispatched: " + response);
    } else {
      Serial.println("HTTP POST error: " + String(httpCode));
    }
    http.end();
  }

  delay(5000); // 5-second sampling interval
}`;

  const gitInstructions = `# 1. Initialize Git repository
git init

# 2. Stage all project files (Frontend, Backend, and Firmware)
git add .

# 3. Commit the implementation
git commit -m "feat: smart poultry farm IoT environmental telemetry and AI disease detection system"

# 4. Link your remote GitHub repository (replace with your repo URL)
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/smart-poultry-farm-iot.git

# 5. Push to GitHub
git push -u origin main`;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-stone-900/90 border border-stone-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-400">
                <Cpu className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Hardware Architecture & ESP32 Code Hub
              </h2>
            </div>
            <p className="text-xs text-stone-400 mt-1">
              Circuit schematics, GPIO pinouts, ready-to-flash Arduino C++ firmware, and GitHub repository push instructions.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono bg-stone-950 px-3 py-1.5 rounded-lg border border-stone-800">
            <span className="text-stone-400">Target MCU:</span>
            <span className="text-emerald-400 font-bold">ESP32 240MHz Dual-Core</span>
          </div>
        </div>
      </div>

      {/* Hardware Schematic & Prototype Photo */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Circuit Prototype Image & Pinout Table */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-stone-900/90 border border-stone-800 rounded-xl p-4 shadow-md space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Breadboard Hardware Assembly</span>
            </h3>
            <div className="rounded-lg overflow-hidden border border-stone-800 bg-stone-950 aspect-video">
              <img
                src="/images/esp32_kit.jpg"
                alt="ESP32 Breadboard Prototype"
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-xs text-stone-400">
              Laboratory setup featuring ESP32-WROOM-32, DHT22 digital hygrometer, MQ-135 tin-dioxide gas sensor, and I2C SSD1306 status display.
            </p>
          </div>

          {/* Pinout Table */}
          <div className="bg-stone-900/90 border border-stone-800 rounded-xl p-4 shadow-md space-y-3">
            <h3 className="text-sm font-bold text-white">ESP32 GPIO Pin Connection Schema</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-stone-800">
                <thead className="bg-stone-950 text-stone-300 font-semibold border-b border-stone-800">
                  <tr>
                    <th className="p-2 border-r border-stone-800">Sensor / Actuator</th>
                    <th className="p-2 border-r border-stone-800">ESP32 Pin</th>
                    <th className="p-2 border-r border-stone-800">Signal Type</th>
                    <th className="p-2">Voltage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-850 font-mono text-[11px] text-stone-300">
                  <tr>
                    <td className="p-2 border-r border-stone-850">DHT22 Data</td>
                    <td className="p-2 border-r border-stone-850 text-emerald-400 font-bold">GPIO 4</td>
                    <td className="p-2 border-r border-stone-850">Single-Bus Digital</td>
                    <td className="p-2">3.3V</td>
                  </tr>
                  <tr>
                    <td className="p-2 border-r border-stone-850">MQ-135 Analog AOUT</td>
                    <td className="p-2 border-r border-stone-850 text-emerald-400 font-bold">GPIO 34 (ADC1)</td>
                    <td className="p-2 border-r border-stone-850">Analog (0-3.3V)</td>
                    <td className="p-2">5.0V VCC</td>
                  </tr>
                  <tr>
                    <td className="p-2 border-r border-stone-850">SSD1306 OLED SDA</td>
                    <td className="p-2 border-r border-stone-850 text-emerald-400 font-bold">GPIO 21</td>
                    <td className="p-2 border-r border-stone-850">I2C Data</td>
                    <td className="p-2">3.3V</td>
                  </tr>
                  <tr>
                    <td className="p-2 border-r border-stone-850">SSD1306 OLED SCL</td>
                    <td className="p-2 border-r border-stone-850 text-emerald-400 font-bold">GPIO 22</td>
                    <td className="p-2 border-r border-stone-850">I2C Clock</td>
                    <td className="p-2">3.3V</td>
                  </tr>
                  <tr>
                    <td className="p-2 border-r border-stone-850">Relay 1 (Exhaust Fans)</td>
                    <td className="p-2 border-r border-stone-850 text-emerald-400 font-bold">GPIO 26</td>
                    <td className="p-2 border-r border-stone-850">Digital Output (Low=ON)</td>
                    <td className="p-2">5.0V Trigger</td>
                  </tr>
                  <tr>
                    <td className="p-2 border-r border-stone-850">Relay 2 (Brooder Heater)</td>
                    <td className="p-2 border-r border-stone-850 text-emerald-400 font-bold">GPIO 27</td>
                    <td className="p-2 border-r border-stone-850">Digital Output (Low=ON)</td>
                    <td className="p-2">5.0V Trigger</td>
                  </tr>
                  <tr>
                    <td className="p-2 border-r border-stone-850">Relay 3 (Cooling Pump)</td>
                    <td className="p-2 border-r border-stone-850 text-emerald-400 font-bold">GPIO 14</td>
                    <td className="p-2 border-r border-stone-850">Digital Output (Low=ON)</td>
                    <td className="p-2">5.0V Trigger</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Arduino C++ Firmware Code & GitHub Guide */}
        <div className="lg:col-span-6 space-y-4">
          {/* Arduino Code Card */}
          <div className="bg-stone-900/90 border border-stone-800 rounded-xl p-4 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">ESP32 Firmware Code (PoultryMonitor.ino)</h3>
              </div>
              <button
                onClick={() => handleCopyCode(arduinoSketch, setCopiedCode)}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-xs text-stone-200 border border-stone-700 font-semibold transition-colors"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied!' : 'Copy Sketch'}</span>
              </button>
            </div>

            <pre className="bg-stone-950 p-3 rounded-lg border border-stone-850 text-[11px] font-mono text-stone-300 max-h-72 overflow-y-auto leading-relaxed">
              {arduinoSketch}
            </pre>
          </div>

          {/* GitHub Submission Commands */}
          <div className="bg-stone-900/90 border border-stone-800 rounded-xl p-4 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-teal-400" />
                <h3 className="text-sm font-bold text-white">GitHub Project Push Commands</h3>
              </div>
              <button
                onClick={() => handleCopyCode(gitInstructions, setCopiedGit)}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-xs text-stone-200 border border-stone-700 font-semibold transition-colors"
              >
                {copiedGit ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedGit ? 'Copied!' : 'Copy Commands'}</span>
              </button>
            </div>
            <p className="text-xs text-stone-400">
              Run these commands in your project terminal to publish your repository to GitHub:
            </p>
            <pre className="bg-stone-950 p-3 rounded-lg border border-stone-850 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed">
              {gitInstructions}
            </pre>
          </div>

          {/* Live In-Browser REST API Tester */}
          <div className="bg-stone-900/90 border border-stone-800 rounded-xl p-4 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Live IoT REST Ingestion Endpoint Tester</h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-950 text-stone-400 border border-stone-800">
                POST /api/telemetry
              </span>
            </div>
            <p className="text-xs text-stone-400">
              Simulate an incoming HTTP JSON packet from an actual ESP32 node to test real-time cloud ingestion and actuator response.
            </p>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] text-stone-400">Temp (°C)</label>
                <input
                  type="text"
                  value={apiTemp}
                  onChange={(e) => setApiTemp(e.target.value)}
                  className="w-full mt-0.5 bg-stone-950 border border-stone-800 rounded p-1.5 text-xs text-white font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-stone-400">Humidity (%)</label>
                <input
                  type="text"
                  value={apiHum}
                  onChange={(e) => setApiHum(e.target.value)}
                  className="w-full mt-0.5 bg-stone-950 border border-stone-800 rounded p-1.5 text-xs text-white font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-stone-400">Ammonia (ppm)</label>
                <input
                  type="text"
                  value={apiNh3}
                  onChange={(e) => setApiNh3(e.target.value)}
                  className="w-full mt-0.5 bg-stone-950 border border-stone-800 rounded p-1.5 text-xs text-white font-mono"
                />
              </div>
            </div>

            <button
              onClick={handleTestApi}
              disabled={isSending}
              className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white flex items-center justify-center gap-1.5 shadow-sm transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSending ? 'Transmitting to Express Endpoint...' : 'Send Telemetry Packet to Server'}</span>
            </button>

            {apiResponse && (
              <div className="mt-2">
                <div className="text-[10px] text-stone-400 mb-1">Server Response (Actuator Directives):</div>
                <pre className="bg-stone-950 p-2.5 rounded border border-stone-800 text-[11px] font-mono text-emerald-300 max-h-36 overflow-y-auto">
                  {apiResponse}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
