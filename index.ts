import { createServer } from 'http';
import { Server } from 'socket.io';
import { MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';


import { RoomModel, PlayerModel } from './models';
import { resolveModuleName } from 'typescript';

dotenv.config();







const uri = process.env.DATABASE_CONN_URL;




const httpServer = createServer();
const io = new Server(httpServer, {
    cors: {
        origin: "*",

      }
})


  
  

mongoose.connect(uri as string)


io.on('connection', (socket) => {
    socket.on("hello", (arg) => {
        console.log(arg)
        socket.emit("sayHello", `hello ${arg}`)
    }
)

socket.on("create-room", async (data) => {
    socket.join(data.roomID)
    console.log(socket.rooms)

    console.log(`${data.username} has created the game with id ${data.roomID} with a maximum of ${data.maxPlayers}`)
   
        const Room =  new RoomModel({
            gameId: data.roomID,
            maxPlayers: data.maxPlayers,
            creator: new PlayerModel({
                username: data.username,
                score: 0
            }),
            winningScore: data.winningScore,
            players: []
        })


        Room.players!.push(new PlayerModel({
            username: data.username,
            score: 0
        }))

        Room.save().then(res => {
            console.log(res)
        }).catch(err => console.log(err))

    
    
})


    
    socket.on("join-room", async (data) => {
     
        socket.join(data.roomID)
        console.log(socket.rooms)

        const Room = await RoomModel.findOne({gameId: data.roomID})
        if(Room?.players.length == Room?.maxPlayers){
            socket.emit("too-many-players")
            return
        }
        
        try{
            
            Room?.players.push(new PlayerModel({
                username: data.username,
                score: 0,
            }))
            Room?.save()
            socket.emit('player-joined', Room)
            
        }
        catch(err){
            console.log(err)
        }
        console.log(`${data.username} has joined the game`)
    })

   socket.on("start_game", (gameId) => {
    console.log(gameId)
    console.log(socket.rooms)
    io.emit("game_started", gameId)
   })
})

httpServer.listen(3001, () => {
    console.log("Connected to socket")
})






