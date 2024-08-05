const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  },
});
const allusers = {};
let rooms = {};
const users = [];

io.on("connection", (socket) => {
  console.log(`User connected to socket server and socket id is ${socket.id}`);
  socket.on("join-user", (username) => {
    console.log(`${username} joined socket connection`);
    allusers[username] = { username, id: socket.id };
    io.emit("joined", allusers);
  });

  socket.on("offer", ({ from, to, offer }) => {
    console.log({ from, to, offer });
    io.to(allusers[to].id).emit("offer", { from, to, offer });
  });

  socket.on("answer", ({ from, to, answer }) => {
    io.to(allusers[from].id).emit("answer", { from, to, answer });
  });

  socket.on("end-call", ({ from, to }) => {
    io.to(allusers[to].id).emit("end-call", { from, to });
  });

  socket.on("call-ended", (caller) => {
    const [from, to] = caller;
    io.to(allusers[from].id).emit("call-ended", caller);
    io.to(allusers[to].id).emit("call-ended", caller);
  });

  socket.on("icecandidate", (candidate) => {
    console.log({ candidate });
    socket.broadcast.emit("icecandidate", candidate);
  });

  socket.on("textChange", (data) => {
    socket.broadcast.emit("textUpdate", data);
  });

  socket.on("inputChange", (data) => {
    socket.broadcast.emit("inputUpdate", data);
  });

  socket.on("disconnect", () => {
    console.log(`User with socket id ${socket.id} disconnected`);
    for (let i in allusers) {
      if (allusers[i].id == socket.id) {
        delete allusers[i];
        console.log(allusers);
      }
    }
  });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log("users", users);
  const user = users.find((user) => user.email === email);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).send("Invalid credentials");
  }

  const token = jwt.sign({ email: user.email }, "your_jwt_secret", {
    expiresIn: "1h",
  });
  res.json({ token });
});

app.post("/register", async (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ email, password: hashedPassword });
  console.log("users", users);
  res.status(200).json({ message: "User registered" });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});

// io.on("connection", (socket) => {
//   console.log(
//     `Someone connected to socket server and socket id is ${socket.id}`
//   );
//   socket.on("join-user", (username, room) => {
//     if (!rooms[room]) {
//       rooms[room] = { room, admin: socket.id };
//       allusers[username] = { username, id: socket.id, room };
//       socket.join(room);
//       console.log(allusers, "users");
//       console.log(rooms, "rooms");
//       io.in(room).emit("join-status", true);
//       io.in(room).emit("joined", allusers);
//     } else {
//       io.to(room)
//         .to(rooms[room].admin)
//         .emit("request-access", socket.id, username, room);
//     }
//   });

//   socket.on("accept-permission", (userId, username, room) => {
//     console.log("accepted", username, room);
//     allusers[username] = { username, id: userId, room };
//     socket.join(room);
//     console.log(allusers, rooms);
//     io.in(room).to(allusers[username].id).emit("permission-granted", true);
//     io.to(room).emit("joined", allusers);
//   });

//   socket.on("offer", ({ from, to, offer }) => {
//     console.log({ from, to, offer });
//     io.to(allusers[from].room)
//       .to(allusers[to].id)
//       .emit("offer", { from, to, offer });
//   });

//   socket.on("answer", ({ from, to, answer }) => {
//     io.to(allusers[from].room)
//       .to(allusers[from].id)
//       .emit("answer", { from, to, answer });
//   });

//   socket.on("end-call", ({ from, to }) => {
//     io.to(allusers[from].room)
//       .to(allusers[to].id)
//       .emit("end-call", { from, to });
//   });

//   socket.on("call-ended", (caller) => {
//     const [from, to] = caller;
//     io.to(allusers[from].room).to(allusers[from].id).emit("call-ended", caller);
//     io.to(allusers[from].room).to(allusers[to].id).emit("call-ended", caller);
//   });

//   socket.on("icecandidate", (candidate, room) => {
//     console.log({ candidate, room });
//     socket.to(room).emit("icecandidate", (candidate, room));
//   });

//   socket.on("textChange", (data, room) => {
//     socket.to(room).broadcast.emit("textUpdate", data.text);
//   });
// });

//main.ts
// this.socketService.server.on('request-access', (id, data, room) => {
//   console.log(`Request from ${data}`, data, room);
//   // const dialogConfig = new MatDialogConfig();
//   // dialogConfig.data = { message: data };

//   // this.dialog.open(DialogContentComponent, dialogConfig);
//   this.socketService.server.emit('accept-permission', id, data, room);
//   console.log('executed');
// });
