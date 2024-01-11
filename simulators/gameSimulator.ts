import { GamePack } from '../gamePack';
import { DemoGame } from './DemoGame'

const express = require('express')
const app = express();
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

gameClient.on('hello_game', () => console.log('Im a game!'))

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, './')));
app.get('/', function (req: any, res: any) {
  res.render('gameSimulator');
});

server.listen(8000)