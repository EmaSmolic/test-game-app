import { Game, GamePack } from '../gamePack';
import { ClientToServerEvents, DemoGame, ServerToClientEvents } from './DemoGame'

const app = require("express")();
const path = require('node:path'); 
import { io, Socket } from "socket.io-client";

/*
var cors = require("cors");
const corsOptions = {
  origin: "*",
  credentials: true,
};
app.use(cors(corsOptions));

app.use(cors());
*/

//HTTP Server 
var server = require('http').createServer(app)
var socket = require('socket.io')(server, {'transports': [ 'websocket' ],})

//game socket
import { io as client_io } from "socket.io-client";
var connectionOptions = {
  timeout: 10000, //before connect_error and connect_timeout are emitted.
  transports: ["websocket"],
};

var clientSocket = client_io("https://test-igrica.onrender.com/", connectionOptions);

socket.on("hi", () => {
  alert("HELLO");
});
const thisGame = new DemoGame(clientSocket)
const env = new GamePack(socket, thisGame)

app.get('/', function (_req: any, res: { sendFile: (arg0: string) => void; }) {
  res.sendFile(path.join(__dirname, './', '/gameSimulator.html'));
});

server.listen(8000)