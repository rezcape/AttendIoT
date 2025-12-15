# ESP32 MQTT Configuration

This document provides instructions for configuring your ESP32 with the MQTT broker details for the AttendIoT project.

**1. Create/Modify `secrets.h`**

In the `esp32/AttendIoT` directory, ensure you have a file named `secrets.h`. If it does not exist, create it. This file is used to store sensitive information like Wi-Fi credentials and MQTT broker details.

Add or update the following definitions in your `secrets.h` file:

```cpp
// Wi-Fi Credentials
#define ssid "YOUR_WIFI_SSID"        // Replace with your Wi-Fi network name
#define password "YOUR_WIFI_PASSWORD" // Replace with your Wi-Fi password

// MQTT Broker Details
#define mqtt_server "10.4.67.183"
#define mqtt_port 1883
#define mqtt_user "kelasb"
#define mqtt_password "kelasb"

// Device ID - Make this unique for each ESP32 device
#define device_id "esp32_scanner_1" // Example: "esp32_room101", "esp32_entrance"

// MQTT Topic for BLE Scan Data
#define topic_scan "attendance/room101/scan"

// BLE Scan Time (in seconds)
#define scanTime 5 // Duration of each BLE scan in seconds
```

**Important Notes:**
*   Replace `"YOUR_WIFI_SSID"` and `"YOUR_WIFI_PASSWORD"` with your actual Wi-Fi network credentials.
*   The `device_id` should be unique for each ESP32 unit you deploy.
*   The `topic_scan` **must** match the topic the backend is listening on for attendance data.

**2. Verify Inclusion in `AttendIoT.ino`**

Ensure that `secrets.h` is included at the top of your `AttendIoT.ino` sketch:

```cpp
#include "secrets.h"
```

After configuring `secrets.h` and uploading your sketch to the ESP32, it should connect to your Wi-Fi network and then to the specified MQTT broker, publishing BLE scan data to the `attendance/room101/scan` topic.