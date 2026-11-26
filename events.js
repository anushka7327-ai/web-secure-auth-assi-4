const EventEmitter = require('events');

// Central event bus: routes emit events, listeners react (logging / side effects).
const appEvents = new EventEmitter();

appEvents.on('user:registered', (user) => {
  console.log(`[event] user registered: ${user.username} (${user.email})`);
});

appEvents.on('user:loggedIn', (user) => {
  console.log(`[event] user logged in: ${user.email}`);
});

appEvents.on('note:created', (note) => {
  console.log(`[event] note created: "${note.title}" by ${note.owner}`);
});

appEvents.on('note:deleted', (note) => {
  console.log(`[event] note deleted: "${note.title}"`);
});

module.exports = appEvents;
