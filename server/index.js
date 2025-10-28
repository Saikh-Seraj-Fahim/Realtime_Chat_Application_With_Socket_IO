const express = require('express');
const http = require('http');
const cors = require('cors');

const { Server } = require("socket.io");
// Server is a constructor function of socket.io

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join_room', (room) => {
        socket.join(room);
        console.log(`User ${socket.id} joined the room ${room}`)
    });

    socket.on('send_message', (data) => {
        socket.to(data.room).emit('receive_message', data);
        console.log("Got the message", data);
    });

    socket.on('typing', ({ username, room }) => {
        socket.to(room).emit('user_typing', username)
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    })
})

server.listen(3001, () => {
    console.log('Server listening on port 3001');
})

// 47 minute 30 second.

// cd server
// npm init
// npm install express
// npm install cors
// npm install socket.io
// node index.js (run server)

// npm install socket.io-client (for client side)

// on()-kono 1 ta event jodi lesten korte chai, jokhon oi event ta ghote, tokhon
// notification pabo.
// emit()-jodi kono kichu broadcast korte chai.



// This code is a Socket.IO server-side event handler — it handles real-time
// communication between clients (like browsers) and the server.

// Let’s go line by line 👇

// 🧠 Basic idea:

// io.on('connection', (socket) => { ... })
// This runs every time a new user connects to your server via WebSocket.

// io = main Socket.IO server instance.

// socket = the individual user's connection (like a private channel for that user).

// ⚡ 1. User connects
// console.log('User connected:', socket.id);


// When someone connects, their unique socket ID is logged.
// Each connected client has a unique ID that can be used to identify them.

// 🏠 2. Joining a room
// socket.on('join_room', (room) => {
//     socket.join(room);
//     console.log(`User ${socket.id} joined the room ${room}`)
// });


// When the client emits join_room with a room name,
// the server adds that socket to the specified room.

// Rooms are like private chat groups or channels.

// Only sockets in the same room can send/receive messages from each other.

// ✅ Example:
// If a user runs socket.emit('join_room', 'room1') on the client,
// they join room1.
// Now they can chat with others in room1.

// 💬 3. Sending a message
// socket.on('send_message', (data) => {
//     socket.to(data.room).emit('receive_message', data)
// });


// When a client sends a message (send_message),
// it contains data (like { room, username, message }).

// The server then sends that message to all other clients in the same room
// (but not back to the sender).

// socket.to(room) = broadcast to everyone in that room except the sender.

// ✅ Example:
// If user A emits:

// socket.emit('send_message', { room: 'room1', message: 'Hello!' });


// Then everyone else in room1 receives:

// socket.on('receive_message', (data) => { ... });

// ⌨️ 4. Typing indicator
// socket.on('typing', ({ username, room }) => {
//     socket.to(room).emit('user_typing', username)
// });


// When a user is typing, they send typing event.

// The server tells others in the same room that this user is typing.

// ✅ Example:
// If “Fahim” types in room1,
// other users in room1 get:

// socket.on('user_typing', (username) => {
//     console.log(username + ' is typing...');
// });

// ❌ 5. User disconnects
// socket.on('disconnect', () => {
//     console.log('User disconnected:', socket.id);
// });


// When a user leaves the page or loses connection,
// the server logs their socket ID.

// 💡 Summary Table:
// Event	     Who triggers it	 What it does
// connection	 Server	             Fired when a user connects
// join_room	 Client	             Joins a specific room
// send_message	 Client	           Sends a message to other users in the same room
// typing	     Client	             Notifies others that someone is typing
// disconnect	 Server	             Fired when a user leaves.