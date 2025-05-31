import { Socket } from "socket.io";

const express= require('express');
const {createServer}= require('http');
const { Server } = require('socket.io');


const app=express();
const port=3000;
const httpServer= createServer(app);
const io = new Server(httpServer,{
  cors:{
    origin:'*'
  }
});


io.on('connection',(socket:Socket)=>{

  let id:string="";

  console.log('you are now connected')
  socket.on('join-room',(roomId:string)=>{
    socket.join(roomId);
    id=roomId;
    console.log(`${roomId} - ${socket.id}`)
  })
  socket.on('PLAYER_ACTION',(msg:any)=>{
    io.to(id).emit( 'chain-of-action',msg);
  })
})


httpServer.listen(port,()=>{
  console.log("listening on port 3000")
})







