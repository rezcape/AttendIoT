const Attendance = require('../models/Attendance');
const Student = require('../models/Student');

// @desc    Get all attendance records
// @route   GET /api/attendance
// @access  Private
exports.getAttendance = async (req, res) => {
    try {
        const { date, studentId, status, page = 1, limit = 10 } = req.query;
        const query = {};

        if (date) {
            // Filter by date (ignoring time)
            const startDate = new Date(date);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(date);
            endDate.setHours(23, 59, 59, 999);
            query.timestamp = { $gte: startDate, $lte: endDate };
        }

        if (studentId) {
            query.studentId = studentId;
        }

        if (status) {
            query.status = status;
        }

        const total = await Attendance.countDocuments(query);
        const attendance = await Attendance.find(query)
            .populate('studentId', 'name studentId email photo')
            .sort({ timestamp: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.status(200).json({
            success: true,
            count: attendance.length,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            },
            data: attendance
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error fetching attendance records',
            error: err.message
        });
    }
};

// @desc    Get today's attendance
// @route   GET /api/attendance/today
// @access  Private
exports.getTodayAttendance = async (req, res) => {
    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const attendance = await Attendance.find({
            timestamp: { $gte: startOfDay, $lte: endOfDay }
        }).populate('studentId', 'name studentId photo').sort({ timestamp: -1 });

        res.status(200).json({
            success: true,
            count: attendance.length,
            data: attendance
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error fetching today\'s attendance',
            error: err.message
        });
    }
};

// @desc    Get attendance statistics
// @route   GET /api/attendance/stats
// @access  Private
exports.getStats = async (req, res) => {
    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const totalStudents = await Student.countDocuments({ status: 'active' });
        
        const presentToday = await Attendance.distinct('studentId', {
            timestamp: { $gte: startOfDay, $lte: endOfDay },
            status: 'present'
        });

        const presentCount = presentToday.length;
        const absentCount = totalStudents - presentCount;
        const attendanceRate = totalStudents > 0 ? (presentCount / totalStudents) * 100 : 0;

        res.status(200).json({
            success: true,
            data: {
                totalStudents,
                presentToday: presentCount,
                absentToday: absentCount,
                attendanceRate: Math.round(attendanceRate * 100) / 100
            }
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error fetching statistics',
            error: err.message
        });
    }
};

// @desc    Get student attendance history
// @route   GET /api/attendance/student/:studentId
// @access  Private
exports.getStudentAttendance = async (req, res) => {
    try {
        // Find student first to get ObjectId if passed as string ID, or use as is
        let student = await Student.findOne({ studentId: req.params.studentId });
        if (!student) {
             // Try by _id if not found by studentId
             try {
                student = await Student.findById(req.params.studentId);
             } catch (e) {
                // Invalid ObjectId
             }
        }

        if (!student) {
             return res.status(404).json({
                success: false,
                message: 'Student not found',
                error: 'Not found'
            });
        }

        const attendance = await Attendance.find({ studentId: student._id })
            .sort({ timestamp: -1 });

        res.status(200).json({
            success: true,
            count: attendance.length,
            data: attendance
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error fetching student history',
            error: err.message
        });
    }
};

// @desc    Manual attendance entry
// @route   POST /api/attendance/manual
// @access  Private
exports.manualEntry = async (req, res) => {
    try {
        const { studentId, status, timestamp } = req.body;

        const student = await Student.findOne({ studentId });
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found',
                error: 'Not found'
            });
        }

        const attendance = await Attendance.create({
            studentId: student._id,
            macAddress: student.macAddress || 'MANUAL',
            timestamp: timestamp || new Date(),
            status: status || 'present',
            deviceId: 'MANUAL_ENTRY'
        });

        // Socket.io emit
        if (req.io) {
            // Populate student info for realtime update
            const populatedAttendance = await Attendance.findById(attendance._id).populate('studentId', 'name studentId photo');
            req.io.emit('attendance-update', populatedAttendance);
        }

        res.status(201).json({
            success: true,
            data: attendance
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: 'Error creating attendance record',
            error: err.message
        });
    }
};
