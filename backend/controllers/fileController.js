const File = require('../models/File');
const fs = require('fs');
const path = require('path');

// @desc    Upload file
// @route   POST /api/files/upload
// @access  Private
exports.uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload a file',
                error: 'No file uploaded'
            });
        }

        const fileData = {
            filename: req.file.filename,
            originalName: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            path: req.file.path,
            uploadedBy: req.user.id
        };

        const file = await File.create(fileData);

        res.status(201).json({
            success: true,
            data: file
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error uploading file',
            error: err.message
        });
    }
};

// @desc    Get all files
// @route   GET /api/files
// @access  Private
exports.getFiles = async (req, res) => {
    try {
        const files = await File.find().sort({ uploadedAt: -1 });

        res.status(200).json({
            success: true,
            count: files.length,
            data: files
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error fetching files',
            error: err.message
        });
    }
};

// @desc    Get single file info
// @route   GET /api/files/:id
// @access  Private
exports.getFile = async (req, res) => {
    try {
        const file = await File.findById(req.params.id);

        if (!file) {
            return res.status(404).json({
                success: false,
                message: 'File not found',
                error: 'Not found'
            });
        }

        res.status(200).json({
            success: true,
            data: file
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: 'Error fetching file',
            error: err.message
        });
    }
};

// @desc    Delete file
// @route   DELETE /api/files/:id
// @access  Private
exports.deleteFile = async (req, res) => {
    try {
        const file = await File.findById(req.params.id);

        if (!file) {
            return res.status(404).json({
                success: false,
                message: 'File not found',
                error: 'Not found'
            });
        }

        // Check if file exists in filesystem and delete it
        if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
        }

        await file.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error deleting file',
            error: err.message
        });
    }
};
