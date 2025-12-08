 ESP32 AttendIoT Firmware

This folder contains the Arduino firmware for the ESP32 attendance scanner.

## Features
- Connects to WiFi.
- Scans for nearby Bluetooth Low Energy (BLE) devices.
- Packages detected devices (MAC address & RSSI) into a JSON payload.
- Publishes the data to an MQTT broker.

## Requirements

### Hardware
- ESP32 Development Board

### Software
- **Arduino IDE** (with ESP32 board support installed)

### Libraries
You need to install the following libraries via the Arduino IDE Library Manager:

1. **PubSubClient** by Nick O'Leary (for MQTT)
2. **ArduinoJson** by Benoit Blanchon (v6 or v7)

## Setup

1. Open `AttendIoT.ino` in Arduino IDE.
2. Edit the **CONFIGURATION** section at the top of the file:
   - `ssid`: Your WiFi Name.
   - `password`: Your WiFi Password.
   - `mqtt_server`: The **Local IP Address** of the computer running the backend (e.g., `192.168.1.15`). **Do not use `localhost`**.
3. Select your ESP32 board and COM port.
4. Upload the code.
5. Open the Serial Monitor (Baud rate: 115200) to verify connectivity.
