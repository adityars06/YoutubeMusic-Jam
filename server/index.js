"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const app = express();
const port = 3000;
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: '*'
    }
});
app.get('/', (_req, res) => {
    res.send('hello');
});
io.on('connection', (socket) => {
    let id = "";
    console.log('you are now connected');
    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        id = roomId;
        console.log(`${roomId} joined`);
    });
    socket.on('PLAYER_ACTION', (msg) => {
        io.to(id).emit({ msg, sender: socket.id });
        console.log(`this is the ${msg} recieved by ${socket.id}`);
    });
});
httpServer.listen(port, () => {
    console.log("listening on port 3000");
});
