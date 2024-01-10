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
  let options = {
    dotfiles: 'deny',
    headers: {
      'x-timestamp': Date.now(),
      'x-sent': true,
      'x-result-message': thisGame // your custom header here
    }
  }
  res.sendFile(path.join(__dirname, './', '/gameSimulator.html', options));
});

server.listen(8000)