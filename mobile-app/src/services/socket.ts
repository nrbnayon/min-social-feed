import { io, Socket } from "socket.io-client";
import { API_URL } from "@/constants/config";

const SOCKET_URL = API_URL.replace(/\/api\/?$/, "");

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 2000,
    });

    if (__DEV__) {
      socket.on("connect", () => {
        console.log(`⚡ [Socket.io] Connected to server: ${SOCKET_URL} (${socket?.id})`);
      });

      socket.on("disconnect", (reason) => {
        console.log(`🔌 [Socket.io] Disconnected: ${reason}`);
      });

      socket.on("connect_error", (error) => {
        console.warn(`⚠️ [Socket.io] Connection error:`, error.message);
      });
    }
  }

  if (!socket.connected) {
    socket.connect();
  }

  return socket;
};

export const joinUserRoom = (userId: string) => {
  const s = getSocket();
  if (userId) {
    s.emit("join:user", userId);
  }
};

export const joinPostRoom = (postId: string) => {
  const s = getSocket();
  if (postId) {
    s.emit("join:post", postId);
  }
};

export const leavePostRoom = (postId: string) => {
  const s = getSocket();
  if (postId) {
    s.emit("leave:post", postId);
  }
};
