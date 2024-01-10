import { GamePack } from '../gamePack';
import { DemoGame } from './DemoGame'

const app = require("express")();
const path = require('node:path'); 

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

const thisGame = new DemoGame()
const env = new GamePack(socket, thisGame)
const gameClient = env.getGameClientSocket()


app.get('/', function (req: any, res: any) {
  req.params.client = gameClient
  res.sendFile(path.join(__dirname, './', '/gameSimulator.html'));
});

server.listen(8000)