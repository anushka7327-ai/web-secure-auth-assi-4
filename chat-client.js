// Quick tester:  node chat-client.js <JWT_TOKEN> "your message"
// (socket.io-client is installed with socket.io's dev tooling: npm i socket.io-client --no-save)
const { io } = require('socket.io-client');
const [token, text = 'Hello from client'] = process.argv.slice(2);

const socket = io('http://localhost:5000', { auth: { token } });
socket.on('connect', () => socket.emit('chatMessage', { room: 'general', message: text }));
socket.on('message', (m) => console.log(`[${m.room}] ${m.user}: ${m.message}`));
socket.on('connect_error', (e) => console.log('Error:', e.message));
