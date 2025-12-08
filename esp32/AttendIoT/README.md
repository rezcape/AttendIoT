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
2. Edit the **CONFIGURATION** section in `secrets.h` (created by the AI for better security/management):
   - `ssid`: Your WiFi Name.
   - `password`: Your WiFi Password.
   - `mqtt_server`: The **Local IP Address** of the computer running the backend (e.g., `192.168.1.15`). **Do not use `localhost`**. This must be reachable by the ESP32.
3. Select your ESP32 board and COM port.
4. Upload the code.
5. Open the Serial Monitor (Baud rate: 115200) to verify connectivity.

## Troubleshooting Common Issues

### 1. Garbled Characters in Serial Monitor (e.g., `....`)
This indicates a **baud rate mismatch** between your ESP32 and the Serial Monitor.

*   **Solution:** In the Arduino IDE Serial Monitor, ensure the baud rate dropdown (usually in the bottom right corner) is set to `115200`.

### 2. MQTT Connection Fails (`failed, rc=-4`) after WiFi Connect
This means your ESP32 successfully connected to WiFi, but then **failed to connect to the MQTT Broker**. Error code `-4` typically means `MQTT_CONNECTION_TIMEOUT`.

**Common Causes & Solutions:**

*   **Network Isolation (Campus/Enterprise WiFi):** Your ESP32 and the MQTT Broker (on your laptop) might be on different subnets or isolated from each other, even if both are on the same WiFi network. This is common in campus environments.
    *   **Solution (Recommended): Use Laptop Hotspot as a Bridge.**
        1.  Ensure your Laptop is connected to the Campus WiFi (so it can reach the Lecturer's Broker).
        2.  On Windows, go to "Mobile Hotspot" settings.
        3.  Set "Share my internet connection from:" to "Wi-Fi".
        4.  Crucially, **Set "Band" to "2.4 GHz"**.
        5.  Update your `esp32/AttendIoT/secrets.h` file with the **SSID and Password of your Laptop's Hotspot**.
        6.  Your ESP32 will connect to your Laptop's Hotspot, and your Laptop will route its traffic to the Campus WiFi. This allows the ESP32 to reach the Lecturer's Broker through your laptop.
    *   **Solution (Alternative for Testing): Use a Public Cloud MQTT Broker.** This bypasses local network issues entirely by connecting both the ESP32 and your backend to a public broker over the internet.
        *   **ESP32:** Update `esp32/AttendIoT/secrets.h` to `mqtt_server = "broker.emqx.io"; mqtt_port = 1883;`
        *   **Backend:** Update `backend/.env` to `MQTT_BROKER=broker.emqx.io` and `MQTT_PORT=1883`.
        *   *Note: This is usually not suitable for sending data to a specific lecturer's local broker.*

*   **Incorrect `mqtt_server` IP:** The IP address for `mqtt_server` in `secrets.h` must be the **local IP address of the machine running your MQTT Broker/Backend**, and it must be reachable from the ESP32.
    *   **Solution:** On your laptop, open Command Prompt and type `ipconfig`. Find the "IPv4 Address" for your active network adapter (e.g., Wi-Fi). Update `mqtt_server` in `secrets.h` to this exact IP.
    *   *Remember:* If you move to a different network or your laptop's IP changes, you'll need to update `secrets.h` again.

*   **Firewall Blocking Port 1883:** Your computer's firewall might be blocking incoming connections on port `1883` (the standard MQTT port).
    *   **Solution:** Temporarily disable your firewall or create an inbound rule to allow connections on TCP port `1883`.

*   **MQTT Broker/Backend Not Running:** Ensure your backend server (which sets up the MQTT client and likely connects to the broker) is actively running.
    *   **Solution:** Start your backend using `npm run dev` or `node server.js` in the `backend/` directory.

### 3. ESP32 Cannot Connect to WiFi (Repeated `...........`)
This indicates the ESP32 is unable to establish a connection with the specified WiFi network.

*   **Solution:**
    *   **Verify SSID/Password:** Double-check `ssid` and `password` in `secrets.h` for exact correctness (case-sensitive).
    *   **2.4GHz Network:** ESP32 (specifically ESP32-WROOM-32 modules, which are common) primarily supports **2.4GHz WiFi networks**. Ensure you are trying to connect to a 2.4GHz network, not a 5GHz-only network. If your router uses a single SSID for both, try separating them or ensuring your ESP32 is close enough to only pick up 2.4GHz.
    *   **Network Visibility:** Ensure the network is broadcasting its SSID and is not a hidden network.
    *   **Signal Strength:** Ensure the ESP32 is within good range of the WiFi access point.