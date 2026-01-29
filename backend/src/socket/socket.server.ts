import { Server } from "socket.io";

export const setupSocketServer = (io: Server) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });

    // Add more socket event handlers here
  });
};
