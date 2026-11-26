const jwt = require('jsonwebtoken');

const DEFAULT_ROOM = 'general';

module.exports = function registerChat(io) {
  // Authenticate every socket connection with the same JWT used for the REST API.
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('No token provided'));
    try {
      socket.user = jwt.verify(token, process.env.JWT_SECRET);
      next();
    } catch {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.join(DEFAULT_ROOM);
    console.log(`${socket.id} joined room ${DEFAULT_ROOM}`);

    socket.on('joinRoom', (room) => {
      socket.join(room);
      console.log(`${socket.id} joined room ${room}`);
      io.to(room).emit('systemMessage', `${socket.user.username} joined ${room}`);
    });

    socket.on('chatMessage', ({ room = DEFAULT_ROOM, message }) => {
      if (!message || !message.trim()) return;
      console.log(`[${room}] ${socket.user.username}: ${message}`);
      io.to(room).emit('message', {
        room,
        user: socket.user.username,
        message,
        time: new Date().toISOString(),
      });
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};
