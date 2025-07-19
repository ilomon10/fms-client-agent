import { Server } from "socket.io";

const io_server = new Server();

io_server.on("connection", (socket) => {
  console.log(`socket ${socket.id} connected`);

  socket.on("authentication", (_socketId, { type }) => {
    if (type === "private") {
      socket.join("private");
    } else {
      socket.join("public");
    }
  });

  socket.on("disconnect", (reason) => {
    console.log(`socket ${socket.id} disconnected due to ${reason}`);
  });
});

export default io_server;
