/*
   Simple BLE Scanner to find device MAC addresses.
   Flash this to your ESP32, open the Serial Monitor (115200 baud),
   and look for your iTag device.
*/

#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEScan.h>
#include <BLEAdvertisedDevice.h>

int scanTime = 5; // Scan duration in seconds
BLEScan* pBLEScan;

class MyAdvertisedDeviceCallbacks: public BLEAdvertisedDeviceCallbacks {
    void onResult(BLEAdvertisedDevice advertisedDevice) {
      Serial.printf("Device Found: %s \n", advertisedDevice.toString().c_str());
      // Explicitly print MAC and Name for easier reading
      Serial.print("  - MAC: ");
      Serial.print(advertisedDevice.getAddress().toString().c_str());
      Serial.print(" | RSSI: ");
      Serial.print(advertisedDevice.getRSSI());
      
      if (advertisedDevice.haveName()) {
        Serial.print(" | Name: ");
        Serial.print(advertisedDevice.getName().c_str());
      }
      
      if (advertisedDevice.haveServiceUUID()) {
        Serial.print(" | ServiceUUID: ");
        Serial.print(advertisedDevice.getServiceUUID().toString().c_str());
      }
      Serial.println();
      Serial.println("------------------------------------------------");
    }
};

void setup() {
  Serial.begin(115200);
  Serial.println("Scanning for BLE devices...");

  BLEDevice::init("");
  pBLEScan = BLEDevice::getScan(); 
  pBLEScan->setAdvertisedDeviceCallbacks(new MyAdvertisedDeviceCallbacks());
  pBLEScan->setActiveScan(true); // Active scan gathers more info (like names)
  pBLEScan->setInterval(100);
  pBLEScan->setWindow(99); 
}

void loop() {
  BLEScanResults *foundDevices = pBLEScan->start(scanTime, false);
  Serial.print("Scan done! Devices found: ");
  Serial.println(foundDevices->getCount());
  
  pBLEScan->clearResults();   // Release memory
  delay(2000); // Wait 2 seconds before next scan
}
