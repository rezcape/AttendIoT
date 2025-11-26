const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const connectMQTT = require("./config/mqtt");
const { handleMQTTMessage } = require("./mqtt/mqttHandler");
const path = require("path");

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for development
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl} - ${new Date().toISOString()}`);
  next();
});

// Inject io into request object
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/students", require("./routes/students"));
app.use("/api/attendance", require("./routes/attendance"));
app.use("/api/files", require("./routes/files"));

// Root route
app.get("/", (req, res) => {
  res.json({ message: "IoT Attendance API is running" });
});

// Socket.io connection
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

console.log("✓ Socket.io initialized");

// MQTT Connection
const mqttClient = connectMQTT();

mqttClient.on("message", (topic, message) => {
  handleMQTTMessage(topic, message, io);
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err ? err.stack : "Unknown error stack");
  res.status(500).json({
    success: false,
    message: "Server Error",
    error: err && err.message ? err.message : "Unknown error",
  });
});

const PORT = process.env.PORT || 5000;

const serverInstance = server.listen(PORT, () => {
  console.log(`✓ Server running on port ${PORT}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully");
  serverInstance.close(() => {
    console.log("Process terminated");
    mqttClient.end();
    mongoose.connection.close(false, () => {
      process.exit(0);
    });
  });
});
