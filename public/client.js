// client.js
document.addEventListener("DOMContentLoaded", () => {
  const socket = io();

  // Determine username (User A or User B) from query string, else prompt.
  const params = new URLSearchParams(window.location.search);
  let username = params.get("user"); // e.g. ?user=User%20A
  if (!username) {
    // If no ?user= parameter, ask for it
    username =
      prompt("Enter your name (e.g. User A or User B):", "User A") || "User A";
  }

  const chatBox = document.getElementById("chatBox");
  const chatForm = document.getElementById("chatForm");
  const messageInput = document.getElementById("messageInput");

  // Function to add a message to the chat box
  function appendMessage(msg) {
    const el = document.createElement("div");
    el.classList.add("message");

    // ✅ Compare the incoming message user to *my username*
    const isMine = msg.user === username;
    el.classList.add(isMine ? "user-a" : "user-b");

    // meta (username label)
    const meta = document.createElement("span");
    meta.classList.add("meta");
    meta.textContent = msg.user + ": ";

    // message text
    const text = document.createElement("span");
    text.classList.add("text");
    text.textContent = msg.text;

    el.appendChild(meta);
    el.appendChild(text);
    chatBox.appendChild(el);

    // Auto-scroll to the bottom
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  // Receive chat history from server
  socket.on("chat history", (history) => {
    history.forEach(appendMessage);
  });

  // Receive new chat messages from server
  socket.on("chat message", (msg) => {
    appendMessage(msg);
  });

  // Send message on form submit
  chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = messageInput.value.trim();
    if (!text) return;
    const payload = {
      user: username,
      text: text,
      timestamp: Date.now(),
    };
    socket.emit("chat message", payload);
    messageInput.value = "";
    messageInput.focus();
  });
});
