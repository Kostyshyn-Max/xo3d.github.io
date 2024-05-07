const express = require('express');
const { createServer } = require('node:http');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('join', (room) => {
    socket.join(room);
    console.log('joined room', room);
    socket.to(room).emit('join', room);
  });
  socket.on('start', (room) => {
    console.log('start');
    io.to(room).emit('start');
  });
  socket.on('setCell', ({room, i, j, k, l, turn}) => {
    socket.to(room).emit('setCell', {i, j, k, l, turn});
  });
  socket.on('win', ({room, turn}) => {
    socket.to(room).emit('win', {turn});
  });
});

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});
