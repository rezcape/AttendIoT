#include <WiFi.h>
#include <PubSubClient.h>
#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEScan.h>
#include <BLEAdvertisedDevice.h>
#include <ArduinoJson.h>

#include "secrets.h"

// ======================= CONFIGURATION =======================
// All configuration is now loaded from secrets.h

// =============================================================

WiFiClient espClient;
PubSubClient client(espClient);
BLEScan* pBLEScan;
void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  // Configuration for better stability
  WiFi.mode(WIFI_STA);
  WiFi.setSleep(false); // Disable power saving to prevent connection drops
  
  // Try to set TxPower as per friend's recommendation
  // Note: If this causes issues, try removing it or setting to WIFI_POWER_19_5dBm (default max)
  WiFi.setTxPower(WIFI_POWER_8_5dBm); 

  WiFi.begin(ssid, password);

  int timeout = 0;
  // Wait up to 20 seconds (40 * 500ms)
  while (WiFi.status() != WL_CONNECTED && timeout < 40) {
    delay(500);
    Serial.print(".");
    timeout++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("");
    Serial.println("WiFi connected");
    Serial.println("IP address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("");
    Serial.print("WiFi connection FAILED! Status: ");
    Serial.println(WiFi.status());
    Serial.println("Restarting in 3 seconds...");
    delay(3000);
    ESP.restart();
  }
}

void reconnect() {
  // Loop until we're reconnected
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    // Attempt to connect
    if (client.connect(device_id, mqtt_user, mqtt_password)) {
      Serial.println("connected");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      delay(5000);
    }
  }
}

void setup() {
  Serial.begin(115200);
  delay(2000); // Wait for Serial Monitor
  Serial.println("Setup started...");

  // Initialize BLE
  Serial.println("Initializing BLE...");
  BLEDevice::init(device_id);
  Serial.println("BLE Initialized.");
  
  pBLEScan = BLEDevice::getScan();
  pBLEScan->setActiveScan(true); // Active scan uses more power, but gets results faster
  pBLEScan->setInterval(100);
  pBLEScan->setWindow(99);  // Scan almost 100% of the time within the interval
  Serial.println("BLE Scan configured.");

  Serial.println("Setting up WiFi...");
  setup_wifi();
  Serial.println("WiFi configured.");
  
  client.setServer(mqtt_server, mqtt_port);
  client.setBufferSize(16384); // Increase buffer size to 16KB
  Serial.println("MQTT configured. Setup done.");
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  // Perform BLE Scan
  Serial.println("Scanning for BLE devices...");
  
  // Return a pointer to the results managed by the BLEScan instance
  BLEScanResults* foundDevices = pBLEScan->start(scanTime, false);
  
  int count = foundDevices->getCount();
  Serial.print("Devices found: ");
  Serial.print(count);
  Serial.println(" (before filtering)");

  // Prepare JSON payload
  // Use 4KB for JSON doc
  DynamicJsonDocument doc(4096);
  
  doc["device_id"] = device_id;
  JsonArray devices = doc.createNestedArray("devices");

  int addedCount = 0;
  for (int i = 0; i < count; i++) {
    // getDevice returns a reference or object, usually safe to copy lightly or ref
    BLEAdvertisedDevice device = foundDevices->getDevice(i);
    int rssi = device.getRSSI();
    String macAddress = device.getAddress().toString().c_str();
    macAddress.toLowerCase();

    // Debug print
    Serial.printf("Scanned: %s | RSSI: %d\n", macAddress.c_str(), rssi);

    // Check for iTag signatures
    bool isITag = false;
    
    // 1. Check Service UUID (Most reliable)
    if (device.haveServiceUUID()) {
      String uuid = device.getServiceUUID().toString().c_str();
      // iTags usually use the "ffe0" service
      if (uuid.indexOf("ffe0") >= 0) {
        isITag = true; 
      }
    }
    
    // 2. Fallback: Check Name
    if (!isITag && device.haveName()) {
       String name = device.getName().c_str();
       if (name.indexOf("iTAG") >= 0 || name.indexOf("MLE-15") >= 0 || name.indexOf("FindMe") >= 0) {
         isITag = true;
       }
    }

    // Filter: Only add identified iTags with decent signal
    if (isITag && rssi > -90 && addedCount < 30) {
        JsonObject deviceObj = devices.createNestedObject();
        
        deviceObj["mac"] = macAddress;
        deviceObj["rssi"] = rssi;
        
        // Optional: Include name if available
        if (device.haveName()) {
          deviceObj["name"] = device.getName().c_str();
        }
        addedCount++;
        Serial.println(" -> MATCH: Added to payload");
    } else if (isITag) {
        Serial.println(" -> MATCH but signal too weak or buffer full");
    }
  }

  // Serialize JSON
  String output;
  serializeJson(doc, output);

  // Publish to MQTT
  Serial.print("Publishing payload (Devices: ");
  Serial.print(addedCount);
  Serial.print(", Size: ");
  Serial.print(output.length());
  Serial.print(" bytes): ");
  
  // Ensure buffer is large enough (4KB is usually sufficient for ~10 devices)
  client.setBufferSize(4096);

  if (client.publish(topic_scan, output.c_str())) {
    Serial.println("Success");
  } else {
    Serial.println("Failed (Payload too big?)");
  }

  // Clean up
  pBLEScan->clearResults();   // Delete results from BLEScan buffer to release memory
  
  // Minimal delay to maximize scan uptime
  delay(100); 
}
