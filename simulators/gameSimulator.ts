import { Environment, Controller } from '../Classes';
import { DemoController } from './DemoController';
import { DemoGame } from './DemoGame'
import { io as client_io } from "socket.io-client";

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

const env = new Environment(socket)
server.listen(8000)
const thisGame = new DemoGame("https://test-igrica.onrender.com/", "test_code")
const thisCtrlr = new DemoController("https://test-igrica.onrender.com/")

setTimeout(() => {
  console.log('TRYING TO CONNECT')
  thisCtrlr.tryConnecting("test_code")
}, 10000);

setTimeout(() => {
  thisCtrlr.sendControl({type: 'some control'})
}, 20000);

setTimeout(() => {
  thisGame.sendMessage({message: 'hello'})
}, 30000);
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, './')));
app.get('/', function (req: any, res: any) {
  res.render('gameSimulator');
});

