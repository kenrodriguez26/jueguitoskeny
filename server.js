
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "public")));

let gameState = Array(9).fill("");
let currentPlayer = "X";
let players = { X: null, O: null };

io.on("connection", (socket) => {
  console.log("Jugador conectado:", socket.id);

  if (!players.X) {
    players.X = socket.id;
    socket.emit("playerAssignment", "X");
  } else if (!players.O) {
    players.O = socket.id;
    socket.emit("playerAssignment", "O");
  } else {
    socket.emit("spectator");
  }

  socket.emit("updateGame", { gameState, currentPlayer });

  socket.on("makeMove", (index) => {
    if (
      gameState[index] === "" &&
      socket.id === players[currentPlayer]
    ) {
      gameState[index] = currentPlayer;
      currentPlayer = currentPlayer === "X" ? "O" : "X";
      io.emit("updateGame", { gameState, currentPlayer });
    }
  });

  socket.on("disconnect", () => {
    if (socket.id === players.X) players.X = null;
    if (socket.id === players.O) players.O = null;
    gameState = Array(9).fill("");
    currentPlayer = "X";
    io.emit("updateGame", { gameState, currentPlayer });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("Servidor corriendo en puerto " + PORT);
});
