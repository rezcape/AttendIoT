const express = require('express');
const {
    getAttendance,
    getTodayAttendance,
    getStats,
    getStudentAttendance,
    manualEntry
} = require('../controllers/attendanceController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getAttendance);
router.get('/today', getTodayAttendance);
router.get('/stats', getStats);
router.get('/student/:studentId', getStudentAttendance);
router.post('/manual', manualEntry);

module.exports = router;
