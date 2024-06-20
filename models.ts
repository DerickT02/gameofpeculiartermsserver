import mongoose from "mongoose";

const Schema = mongoose.Schema;

const PlayerSchema = new Schema({
    username: String,
    score: Number,
})

const RoomSchema = new Schema({
    gameId: String,
    maxPlayers: Number,
    creator: PlayerSchema,
    winningScore: Number,
    players: [PlayerSchema],
    scores: {
        type: Map,
        of: Number,
        default: {}
    }
})



export const RoomModel = mongoose.model("Room", RoomSchema)
export const PlayerModel = mongoose.model("Player", PlayerSchema)