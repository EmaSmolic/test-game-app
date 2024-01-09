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

const thisGame = new DemoGame()
const env = new GamePack(server, thisGame)

app.get('/', function (_req: any, res: { sendFile: (arg0: string) => void; }) {
  res.sendFile(path.join(__dirname, './', '/gameSimulator.html'));
});

server.listen(8000)