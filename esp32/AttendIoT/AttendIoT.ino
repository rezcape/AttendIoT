#include <WiFi.h>
#include <PubSubClient.h>
#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEScan.h>
#include <BLEAdvertisedDevice.h>
#include <ArduinoJson.h>

#include "secrets.h"

WiFiClient espClient;
PubSubClient client(espClient);
BLEScan* pBLEScan;

void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
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
  
  // Initialize BLE
  BLEDevice::init(device_id);
  pBLEScan = BLEDevice::getScan();
  pBLEScan->setActiveScan(true); // Active scan uses more power, but gets results faster
  pBLEScan->setInterval(100);
  pBLEScan->setWindow(99);

  setup_wifi();
  client.setServer(mqtt_server, mqtt_port);
  client.setBufferSize(16384); // Increase buffer size to 16KB
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  // Perform BLE Scan
  Serial.println("Scanning for BLE devices...");
  BLEScanResults foundDevices = *pBLEScan->start(scanTime, false);
  int count = foundDevices.getCount();
  Serial.print("Devices found: ");
  Serial.print(count);
  Serial.println(" (before filtering)");

  // Prepare JSON payload
  // Use 12KB for JSON doc (fit in stack)
  DynamicJsonDocument doc(12288);
  
  doc["device_id"] = device_id;
  JsonArray devices = doc.createNestedArray("devices");

  int addedCount = 0;
  for (int i = 0; i < count; i++) {
    BLEAdvertisedDevice device = foundDevices.getDevice(i);
    int rssi = device.getRSSI();

    // Filter: Ignore very weak signals (far away) to save memory
    // and limit total devices to prevent packet overflow
    if (rssi > -90 && addedCount < 50) {
        JsonObject deviceObj = devices.createNestedObject();
        String macAddress = device.getAddress().toString().c_str();
        // Ensure lowercase to match backend expectation
        macAddress.toLowerCase();
        
        deviceObj["mac"] = macAddress;
        deviceObj["rssi"] = rssi;
        
        // Optional: Include name if available (might consume more memory)
        if (device.haveName()) {
          deviceObj["name"] = device.getName().c_str();
        }
        addedCount++;
    }
  }

  // Serialize JSON
  String output;
  serializeJson(doc, output);

  // Publish to MQTT
  Serial.print("Publishing payload (Devices: ");
  Serial.print(addedCount);
  Serial.print("): ");
  
  if (client.publish(topic_scan, output.c_str())) {
    Serial.println("Success");
  } else {
    Serial.println("Failed (Payload too big?)");
  }

  // Clean up
  pBLEScan->clearResults();   // Delete results fromBLEScan buffer to release memory
  
  // Wait a bit before next scan
  delay(2000);
}
