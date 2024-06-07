import { createServer } from 'http';
import { Server } from 'socket.io';
import { MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import Openai from 'openai';
import { RoomModel, PlayerModel } from './models';
import { resolveModuleName } from 'typescript';

dotenv.config();


const openai = new Openai({apiKey: process.env.NEXT_PUBLIC_OPENAI_KEY})




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
            io.to(data.roomID).emit('player-joined', Room)
            
        }
        catch(err){
            console.log(err)
        }
        console.log(`${data.username} has joined the game`)
    })

   socket.on("start_game", (gameId) => {
    console.log(gameId)
    console.log(socket.rooms)
    io.to(gameId).emit("game_started")
   })

   socket.on("player_change", (data) => {
    console.log("did i get this")
    io.emit("turn_change", data)

   
})

 socket.on("generate_prompt", async (data) => {
    console.log(`did i get this prompt ${data.prompt}`)
    
    let response = await openai.images.generate({
        model: "dall-e-2",
        prompt: data.prompt,
        n: 1,
        size: "512x512",
      })
        let image_url = response.data[0].url;
        console.log(image_url)
      io.to(data.gameId).emit("prompt_generated",
      
      {promptImage: image_url, username: data.username}, () => {
        console.log("event emitted")
      }) 
 })

 socket.on("response_sent", (data) => {
    let resdata = {username: data.username, response: data.prompt}
    io.to(data.gameID).emit("response_given", resdata)
 })

socket.on("leave_game", (data) => {
    console.log(`${data.username} has left the game with id ${data.roomID}`)
    socket.leave(data.roomID)
   })
});

httpServer.listen(3001, () => {
    console.log("Connected to socket")
})






