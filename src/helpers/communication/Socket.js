// src/composables/useWebsocket.js
import { isReactive, reactive, ref, watch } from "vue";
import { io } from "socket.io-client";

const connected = ref(false);
const updates = ref([]);
let currentRoom = null;

// Create socket instance
const socket = io("http://127.0.0.1:3001", {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000
});

// Connection events
socket.on("connect", () => {
  connected.value = true;
  console.log("Connected to Socket.IO server:", socket.id);

  // Re-join last room if any
  if (currentRoom) {
    socket.emit("join-room", currentRoom);
    console.log("Re-joined room:", currentRoom);
  }
});

socket.on("disconnect", () => {
  connected.value = false;
  console.log("Disconnected from server");
});

socket.on("connect_error", (err) => {
  connected.value = false;
  console.error("Connection error:", err.message);
});

// Listen for updates
socket.on("manage-event-stage", (data) => {
  updates.value.push(data);
});

// Function to join a room
function connectRoom(room) {
  currentRoom = room;
  if (connected.value) {
    socket.emit("join-room", room);
    console.log("Joined room:", room);
  } else {
    console.log("Waiting to connect, will join room on connect:", room);
  }
}

// Recursive merge: updates `target` in-place with `source`
function mergeData(target, source) {
  if (Array.isArray(source)) {
    source.forEach((item, i) => {
      if (target[i] !== undefined) {
        mergeData(target[i], item);
      } else {
        // Wrap new objects/arrays in reactive
        target.push(typeof item === 'object' ? reactive(item) : item);
      }
    });
  } else if (source && typeof source === "object") {
    Object.keys(source).forEach((key) => {
      if (target[key] !== undefined && typeof target[key] === "object" && target[key] !== null) {
        mergeData(target[key], source[key]);
      } else {
        // Vue-reactive safe assignment
        target[key] = typeof source[key] === "object" && source[key] !== null
          ? reactive(source[key])
          : source[key];
      }
    });
  }
  return { ...target };
}
// Function to leave a room
function leaveRoom(room) {
  if (connected.value && room) {
    socket.emit("leave-room", room);
    console.log("Left room:", room);
  }
}

watch(connected, (conn) => {
  if (!conn) {
    console.log("Socket disconnected, trying to reconnect...");
    connectRoom(currentRoom);
  }
});

const ehubSocket = { connected, updates, socket, connectRoom, leaveRoom, mergeData };
export default ehubSocket;

