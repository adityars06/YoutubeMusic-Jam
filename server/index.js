"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const app = express();
const port = process.env.PORT||3000;
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: '*'
    }
});
io.on('connection', (socket) => {
    let id = "";
    console.log('you are now connected');
    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        id = roomId;
    });
    socket.on('PLAYER_ACTION', (msg) => {
        socket.to(id).emit('chain-of-action', msg);
    });
    socket.on("VIDEO_ID",(msg)=>{
        const {videoId}= msg;
        socket.to(id).emit('VIDEO_ID',videoId)
    })
});
httpServer.listen(port, () => {
    console.log(`listening on ${port}`);
});
