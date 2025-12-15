#ifndef SECRETS_H
#define SECRETS_H

// ======================= CONFIGURATION (PUBLIC BROKER) =======================

// WiFi Credentials (Keep your existing WiFi)
const char* ssid = "ITS-WIFI-TW2";
const char* password = "itssurabaya";

// MQTT Broker Settings -> broker.emqx.io
const char* mqtt_server = "broker.emqx.io";
const int mqtt_port = 1883;
const char* mqtt_user = "";     // No auth for public test
const char* mqtt_password = ""; // No auth for public test

// MQTT Topics
const char* topic_scan = "5027241085/Attendance/scan";

// Scanner Identity
const char* device_id = "scanner_room_101";

// Scanning Settings
const int scanTime = 10;

// =============================================================

#endif
