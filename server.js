const cors = require("cors");
const app= require("express")();
//const app = express();
app.use(cors());
const httpServer = require("http").createServer(app);
const io= require("socket.io")(httpServer, {
 cors: {
    // origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});
const color = require("colors");
const { get_Current_User, user_Disconnect, join_User } = require("./dummyUser");

//app.use(express());

const port = process.env.PORT || 8000;


httpServer.listen(
  port,
  console.log(
    `Server is running on the port no: ${(port)} `
      .green
  )
);

//const io = socket(server);

io.on("connection", (socket) => {
  socket.on("joinRoom", ({ username, roomname }) => {
    const p_user = join_User(socket.id, username, roomname);
    console.log(socket.id, "=id");
    socket.join(p_user.room);

    socket.emit("message", {
      userId: p_user.id,
      username: p_user.username,
      text: `Welcome ${p_user.username}`,
    });

    socket.broadcast.to(p_user.room).emit("message", {
      userId: p_user.id,
      username: p_user.username,
      text: `${p_user.username} has joined the chat`,
    });
  });

  socket.on("chat", (text) => {
    const p_user = get_Current_User(socket.id);

    io.to(p_user.room).emit("message", {
      userId: p_user.id,
      username: p_user.username,
      text: text,
    });
  });

  socket.on("disconnect", () => {
    const p_user = user_Disconnect(socket.id);

    if (p_user) {
      io.to(p_user.room).emit("message", {
        userId: p_user.id,
        username: p_user.username,
        text: `${p_user.username} has left the room`,
      });
    }
  });
});