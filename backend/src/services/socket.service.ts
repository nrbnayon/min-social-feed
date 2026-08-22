import { Server as SocketIOServer } from "socket.io";
import type { Server as HttpServer } from "node:http";
import { logger } from "../utils/logger.js";

let io: SocketIOServer | null = null;

export const initSocketServer = (httpServer: HttpServer): SocketIOServer => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    transports: ["websocket", "polling"],
  });

  io.on("connection", (socket) => {
    logger.debug(`[Socket.io] Client connected: ${socket.id}`);

    // Join user room for targeted notifications/events
    socket.on("join:user", (userId: string) => {
      if (userId) {
        socket.join(`user:${userId}`);
        logger.debug(`[Socket.io] Socket ${socket.id} joined room user:${userId}`);
      }
    });

    // Join post room for live post comments/likes
    socket.on("join:post", (postId: string) => {
      if (postId) {
        socket.join(`post:${postId}`);
        logger.debug(`[Socket.io] Socket ${socket.id} joined room post:${postId}`);
      }
    });

    socket.on("leave:post", (postId: string) => {
      if (postId) {
        socket.leave(`post:${postId}`);
        logger.debug(`[Socket.io] Socket ${socket.id} left room post:${postId}`);
      }
    });

    socket.on("disconnect", () => {
      logger.debug(`[Socket.io] Client disconnected: ${socket.id}`);
    });
  });

  logger.info("⚡ Socket.io real-time engine initialized");
  return io;
};

export const getIO = (): SocketIOServer | null => io;

// Real-time Event Emitters
export const emitPostLiked = (data: {
  postId: string;
  liked: boolean;
  likeCount: number;
  userId: string;
}) => {
  if (!io) return;
  io.emit("post:liked", data);
};

export const emitPostCommented = (data: {
  postId: string;
  comment: any;
  commentCount: number;
}) => {
  if (!io) return;
  io.emit("post:commented", data);
};

export const emitNewNotification = (recipientId: string, notification: any) => {
  if (!io) return;
  io.to(`user:${recipientId}`).emit("notification:new", notification);
};
