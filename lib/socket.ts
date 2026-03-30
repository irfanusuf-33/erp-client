import { io, Socket } from "socket.io-client";

const resolveSocketUrl = () => {
  const rawUrl = process.env.VITE_BASE_BACKEND_URL;
  

  if (!rawUrl) {
    return window.location.origin;
  }

  try {
    const parsed = new URL(rawUrl);
    return parsed.origin;
  } catch {
    return rawUrl;
  }
};

const socket: Socket = io(resolveSocketUrl(), {
  transports: ["websocket"],
  path: "/socket.io",
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 3000,
  timeout: 10000,
  autoConnect: true,
});



socket.on("connect", () => {
  // console.log("Socket connected:", socket.id);
});

socket.on("disconnect", (reason: string) => {
  // console.log("Socket disconnected:", reason);
});

socket.on("connect_error", (error: any) => {
  // console.error("Socket connection error:", error);
});

export default socket;
