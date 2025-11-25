const Student = require('../models/Student');

// @desc    Get all students
// @route   GET /api/students
// @access  Private
exports.getStudents = async (req, res) => {
    try {
        let query;
        
        // Copy req.query
        const reqQuery = { ...req.query };

        // Fields to exclude
        const removeFields = ['select', 'sort', 'page', 'limit', 'search'];
        removeFields.forEach(param => delete reqQuery[param]);

        // Create query string
        let queryStr = JSON.stringify(reqQuery);

        // Finding resource
        let findQuery = JSON.parse(queryStr);
        
        // Search functionality
        if (req.query.search) {
            findQuery = {
                ...findQuery,
                $or: [
                    { name: { $regex: req.query.search, $options: 'i' } },
                    { email: { $regex: req.query.search, $options: 'i' } },
                    { studentId: { $regex: req.query.search, $options: 'i' } }
                ]
            };
        }

        query = Student.find(findQuery);

        // Pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const total = await Student.countDocuments(findQuery);

        query = query.skip(startIndex).limit(limit);

        // Executing query
        const students = await query;

        // Pagination result
        const pagination = {};

        if (endIndex < total) {
            pagination.next = {
                page: page + 1,
                limit
            };
        }

        if (startIndex > 0) {
            pagination.prev = {
                page: page - 1,
                limit
            };
        }
        
        pagination.total = total;
        pagination.pages = Math.ceil(total / limit);
        pagination.page = page;
        pagination.limit = limit;

        res.status(200).json({
            success: true,
            count: students.length,
            pagination,
            data: students
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: 'Error fetching students',
            error: err.message
        });
    }
};

// @desc    Get single student
// @route   GET /api/students/:id
// @access  Private
exports.getStudent = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: `Student not found with id of ${req.params.id}`,
                error: 'Not found'
            });
        }

        res.status(200).json({
            success: true,
            data: student
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: 'Error fetching student',
            error: err.message
        });
    }
};

// @desc    Create new student
// @route   POST /api/students
// @access  Private
exports.createStudent = async (req, res) => {
    try {
        const student = await Student.create(req.body);

        // Socket.io emit
        if (req.io) {
            req.io.emit('student-added', student);
        }

        res.status(201).json({
            success: true,
            data: student
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: 'Error creating student',
            error: err.message
        });
    }
};

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private
exports.updateStudent = async (req, res) => {
    try {
        let student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: `Student not found with id of ${req.params.id}`,
                error: 'Not found'
            });
        }

        student = await Student.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        // Socket.io emit
        if (req.io) {
            req.io.emit('student-updated', student);
        }

        res.status(200).json({
            success: true,
            data: student
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: 'Error updating student',
            error: err.message
        });
    }
};

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private
exports.deleteStudent = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: `Student not found with id of ${req.params.id}`,
                error: 'Not found'
            });
        }

        await student.deleteOne();

        // Socket.io emit
        if (req.io) {
            req.io.emit('student-deleted', { id: req.params.id });
        }

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: 'Error deleting student',
            error: err.message
        });
    }
};
