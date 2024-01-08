import { Game, GamePack } from '../gamePack';
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
var server = require('http').createServer(app).listen(8888);
var socket = require('socket.io')(server)

//Allow Cross Domain Requests
socket.set('transports', [ 'websocket' ]);
const thisGame = new DemoGame()
console.log(thisGame)
const env = new GamePack(socket, thisGame)

socket.on('connection', (client: any) => {
  socket.emit('hello')
})

app.get('/', function (_req: any, res: { sendFile: (arg0: string) => void; }) {
  res.sendFile(path.join(__dirname, './', '/gameSimulator.html'));
});

http.listen(8000);
