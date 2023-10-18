const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log("Un usuario se ha conectado");

  socket.on("disconnect", () => {
    console.log("Usuario desconectado");
  });

  // Escuchar eventos del cliente
  socket.on("newNote", (note) => {
    socket.broadcast.emit("newNote", note);
  });

  socket.on("updateNote", (data) => {
    io.emit("updateNote", data);
  });

  socket.on("deleteNote", (noteId) => {
    socket.broadcast.emit("deleteNote", noteId);
  });
});

server.listen(PORT, () => {
  console.log(`El servidor se está ejecutando en el puerto ${PORT}`);
});
