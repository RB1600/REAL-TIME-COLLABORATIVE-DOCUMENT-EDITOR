// server.js
const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/collab-editor", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("MongoDB connected"));

// Document Schema
const DocumentSchema = new mongoose.Schema({
  title: String,
  content: String
});

const Document = mongoose.model("Document", DocumentSchema);

// REST API
app.post("/documents", async (req, res) => {
  const { title, content } = req.body;
  const doc = await Document.create({ title, content });
  res.json(doc);
});

app.get("/documents/:id", async (req, res) => {
  const doc = await Document.findById(req.params.id);
  res.json(doc);
});

// Socket.IO Real-Time Communication
io.on("connection", socket => {
  console.log("New client connected:", socket.id);

  socket.on("join-document", docId => {
    socket.join(docId);
    console.log(`User ${socket.id} joined doc ${docId}`);
  });

  socket.on("send-changes", ({ docId, content }) => {
    socket.to(docId).emit("receive-changes", content);
  });
});

server.listen(5000, () => console.log("Server running on http://localhost:5000"));
