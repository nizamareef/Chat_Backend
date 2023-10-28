const express = require("express")
const dotenv = require("dotenv").config() 
const cors = require('cors')
var app = express();
const connectDB = require("./db");
const port = process.env.PORT
const path = require("path");


app.use(express.json())
app.use(cors())
connectDB()
app.use("/api/auth", require("./Routes/auth"))
app.use("/api/chat", require("./Routes/chat"))
app.use("/api/messages", require("./Routes/messages"))


//---------------------Deployment-----------------------
// const __dirname1 = path.resolve();

// if (process.env.NODE_ENV === "production") {
//   app.use(express.static(path.join(__dirname1, "/client/build")));

//   app.get("*", (req, res) =>
//     res.sendFile(path.resolve(__dirname1, "client", "build", "index.html"))
//   );

// } else {
//   app.get("/", (req, res) => {
//     res.send("API is running..");
//   });
// }
//---------------------Deployment-----------------------

const server = app.listen(port, console.log(`Server listening at ${port}`))
const io = require('socket.io')(server, {
    pingTimeout: 60000,
    cors: {
        origin: "http://localhost:3000",
    },
})
io.on("connection", (socket) => {
    console.log("connected to socket.io")
    socket.on("setup", (userData) => {
        socket.join(userData.user._id)
        socket.emit("connected");
    })
    socket.on("join Chat", (room) => {
        socket.join(room);
        console.log("user joined the room " + room)
    })

    socket.on("typing",(room)=>socket.in(room).emit("typing"))
    socket.on("stop typing",(room)=>socket.in(room).emit("stop typing"));


    socket.on("new message", (newMessageReceived) => {
        var chat = newMessageReceived.chat;
        if (!chat.users) return console.log("chat.users not defined ")
        chat.users.forEach(user => {
            if (user._id == newMessageReceived.sender._id) return;

            socket.in(user._id).emit("message received", newMessageReceived)
        })
    }) 
     
    socket.off("setup",()=>{
        console.log("USER DISCONNECTED");
        socket.leave(userData.user._id)
    })
   
})