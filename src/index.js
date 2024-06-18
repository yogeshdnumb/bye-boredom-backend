import "dotenv/config";
import express from "express";
import { Server } from "socket.io";
import { createServer } from "node:http";
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin:
      process.env.NODE_ENV == "production"
        ? process.env.PROD_FRONTEND_URL
        : process.env.DEV_FRONTEND_URL,
  },
});

app.get("/", (req, res) => res.send("socket.io server"));

io.use((socket, next) => {
  socket.join(["general", "anime", "india"]);
  const username = socket.handshake.auth.username;
  if (!username) {
    return next(new Error("invalid username"));
  }
  socket.username = username;
  next();
});

io.on("connection", (socket) => {
  console.log(`${socket.id.substring(0, 4)} connected`);

  // to is roomId
  socket.on("message", ({ text, from, to, isRoom }) => {
    console.log({ from, to, text, isRoom });
    socket.to(to).emit("message", {
      text,
      username: socket.username,
      from,
      to,
      isRoom,
    });
  });
});

httpServer.listen(process.env.PORT || 3000, () => {
  console.log(`server running at http://localhost:${process.env.PORT || 3000}`);
});
