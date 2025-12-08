const Student = require('../models/Student');
const Attendance = require('../models/Attendance');

const handleMQTTMessage = async (topic, message, io) => {
    try {
        const msgString = message.toString();
        const payload = JSON.parse(msgString);

        console.log(`MQTT Message received on ${topic}`);
        console.log('Raw Payload:', JSON.stringify(payload, null, 2)); // Debug: Log full payload
        
        if (topic === 'attendance/room101/scan') {
            // Emit raw device detected event
            io.emit('device-detected', payload);

            if (payload.devices && Array.isArray(payload.devices)) {
                for (const device of payload.devices) {
                    await processDevice(device, payload.device_id, io);
                }
            }
            
            console.log(`Processed ${payload.devices ? payload.devices.length : 0} devices from scan.`);
        }
    } catch (error) {
        console.error('Error processing MQTT message:', error);
    }
};

const processDevice = async (deviceData, scannerId, io) => {
    try {
        const { mac, rssi } = deviceData;
        // Normalize MAC
        const normalizedMac = mac.toLowerCase();

        // Find student by MAC
        const student = await Student.findOne({ macAddress: normalizedMac });

        if (student) {
            // Check if attendance already recorded recently (e.g., within last 5 minutes) to prevent spam
            // Or logic could be: 1 record per day, or record every scan.
            // Requirement says "Create attendance records", implying every valid scan or maybe throttled.
            // Let's assume we want to record it but maybe check for duplicate within a short window 
            // to avoid filling DB with milliseconds difference records.
            
            // For now, let's just record it as per requirements "Create attendance records"
            // But practically, we usually limit to once per session or 10 mins.
            // Let's check if there is a record in the last 1 minute.
            
            const oneMinuteAgo = new Date(Date.now() - 60000);
            const existingRecord = await Attendance.findOne({
                studentId: student._id,
                timestamp: { $gt: oneMinuteAgo }
            });

            if (!existingRecord) {
                const attendance = await Attendance.create({
                    studentId: student._id,
                    macAddress: normalizedMac,
                    rssi: rssi,
                    deviceId: scannerId,
                    status: 'present'
                });

                console.log(`Attendance recorded for ${student.name}`);
                
                // Emit real-time update
                const populatedAttendance = await Attendance.findById(attendance._id).populate('studentId', 'name studentId photo');
                io.emit('attendance-update', populatedAttendance);
            }
        } else {
            // Unknown device
            console.log(`Unknown device: ${normalizedMac}`);
        }
    } catch (err) {
        console.error(`Error processing device ${deviceData.mac}:`, err);
    }
};

module.exports = { handleMQTTMessage };
