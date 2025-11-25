const mqtt = require('mqtt');

const connectMQTT = () => {
    const client = mqtt.connect(`mqtt://${process.env.MQTT_BROKER}:${process.env.MQTT_PORT}`, {
        username: process.env.MQTT_USERNAME,
        password: process.env.MQTT_PASSWORD,
        reconnectPeriod: 5000 // Auto-reconnect every 5 seconds
    });

    client.on('connect', () => {
        console.log(`✓ MQTT connected to broker ${process.env.MQTT_BROKER}:${process.env.MQTT_PORT}`);
        client.subscribe('attendance/room101/scan', (err) => {
            if (!err) {
                console.log('✓ Subscribed to MQTT topic: attendance/room101/scan');
                client.publish('attendance/backend/status', 'online');
            }
        });
    });

    client.on('error', (err) => {
        console.error('MQTT Error:', err);
    });

    client.on('close', () => {
        console.log('MQTT connection closed');
    });

    return client;
};

module.exports = connectMQTT;
