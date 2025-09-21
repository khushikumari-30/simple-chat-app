// server.js
const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

// serve files from public folder
app.use(express.static("public"));

// optional: keep simple in-memory chat history (remove if not needed)
const HISTORY_LIMIT = 200;
let chatHistory = [];

// When a client connects
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // send chat history to the newly connected client
  socket.emit("chat history", chatHistory);

  // listen for messages from client
  socket.on("chat message", (msg) => {
    // msg = { user: 'User A', text: 'hello', timestamp: ... }
    const message = {
      user: msg.user,
      text: msg.text,
      timestamp: msg.timestamp || Date.now(),
    };

    // add to history
    chatHistory.push(message);
    if (chatHistory.length > HISTORY_LIMIT) chatHistory.shift();

    // send to all clients (including sender)
    io.emit("chat message", message);
  });

  // handle disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
