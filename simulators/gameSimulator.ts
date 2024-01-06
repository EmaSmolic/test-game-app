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

var http = require("http").createServer(app);
const socket = require("socket.io")(http);

const thisGame = new DemoGame()
console.log(thisGame)
const env = new GamePack(socket, thisGame)

app.get('/', function (_req: any, res: { sendFile: (arg0: string) => void; }) {
  res.sendFile(path.join(__dirname, './', '/gameSimulator.html'));
});

http.listen(8000);
