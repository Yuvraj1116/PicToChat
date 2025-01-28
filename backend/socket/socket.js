import{Server} from 'socket.io';
import express from 'express';
import http from 'http';

const app = express();

const server = http.createServer(app);

const io = new Server(server,{
    cors:{
        origin:process.env.URL,
        methods:['GET','POST']
    }
})

const userSocketMap = {}; //This map store socket id corresponding the user id it means user.id -> socket.id
export const getReceiverSocketId =(reciverId)=>userSocketMap[reciverId];


io.on('connection',(socket)=>{
    const userId = socket.handshake.query.userId;
    if(userId){
        userSocketMap[userId] = socket.id;
        console.log(`User Connected:UserId= ${userId},socketID= ${socket.id}`);
    }

    io.emit('getOnlineUsers', Object.keys(userSocketMap));


    socket.on('disconnect',()=>{
         if(userId){
            console.log(`User disconnected:UserId= ${userId},socketID= ${socket.id}`);
            delete userSocketMap[userId];
         }
         io.emit('getOnlineUsers',Object.keys(userSocketMap));  
    });
})

export{app,server,io};