import { createServer } from 'http';
import { Server } from 'socket.io';

const httpServer = createServer();
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:3000",

      }
})

io.on('connection', (socket) => {
    socket.on("hello", (arg) => {
        console.log(arg)
        socket.emit("sayHello", `hello ${arg}`)
    }
)

    socket.on("bye", () => {
        socket.emit("sayBye", "")
    })
})

httpServer.listen(3001, () => {
    console.log("Connected to socket")
})




