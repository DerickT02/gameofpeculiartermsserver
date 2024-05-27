import mongoose from "mongoose";

const Schema = mongoose.Schema;

const PlayerSchema = new Schema({
    username: String,
    score: Number,
})

const RoomSchema = new Schema({
    gameId: String,
    maxPlayers: Number,
    winningScore: Number,
    players: [PlayerSchema]
})



export const RoomModel = mongoose.model("Room", RoomSchema)
export const PlayerModel = mongoose.model("Player", PlayerSchema)