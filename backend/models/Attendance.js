const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    macAddress: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now,
        required: true
    },
    rssi: {
        type: Number
    },
    deviceId: {
        type: String, // ESP32 device identifier
        required: false
    },
    sessionId: {
        type: String
    },
    status: {
        type: String,
        enum: ['present', 'absent'],
        default: 'present'
    }
});

// Index for faster queries on common fields
AttendanceSchema.index({ studentId: 1, timestamp: -1 });
AttendanceSchema.index({ timestamp: -1 });

module.exports = mongoose.model('Attendance', AttendanceSchema);
