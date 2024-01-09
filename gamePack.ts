import { Server, Socket } from 'socket.io';
  import { io } from "socket.io-client";
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { ServerToClientEvents, ClientToServerEvents } from './simulators/DemoGame';

export class GamePack {
  private readonly serverSocket: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;
  private readonly game: Game;
  private controllers: Array<Controller>

  constructor(serverSocket: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>, game: Game) {
    this.serverSocket = serverSocket
    this.game = game
    this.controllers = []

    //set game socket
    this.game.setSocket(io("https://test-igrica.onrender.com/", {
      reconnectionAttempts:10000, //avoid having user reconnect manually in order to prevent dead clients after a server restart
      timeout: 10000, //before connect_error and connect_timeout are emitted.
      transports: ["websocket"],
    }))

    this.serverSocket.on('connection', client => {
      console.log('connected', client)
      this.serverSocket.sockets.emit("hi", "everyone");
      console.log('sockets',this.serverSocket.sockets)
      //this.socket.to(id).emit("my message", msg);
    });

    //subscribe to controller web service opening
  }

  //returns true if controller connected, false in case of controller rejection
  private onControllerServiceOpened(): Boolean {
    //return if rejected
    if (!this.game.acceptNewController(this)) return false

    //init new Controller with unique one-time temporary id
    const ctrlrTid = this.game.generateTid(this)
    const ctrlr = new Controller(ctrlrTid)

    //save it to controllers
    this.controllers.push(ctrlr)
    return true

  }

  public getControllers() {
    return this.controllers
  }

}

export abstract class Game {
  private clientSocket: any
  constructor() {
    //this.socket = io("https://test-igrica.onrender.com/", { transports: ["websocket"] })
    //console.log('game client socket', this.socket)
  }

  public getSocket(): Socket<DefaultEventsMap, DefaultEventsMap> { return this.clientSocket }
  public setSocket(clientSocket : any): void { this.clientSocket = clientSocket}

  //commonly waiting for the required number of controllers registered, maybe something else...
  public abstract checkStartCondition(gamePackContext: GamePack): Boolean
  public abstract acceptNewController(gamePackContext: GamePack): Boolean
  public abstract generateTid(gamePackContext: GamePack): string


}

class Controller {
  //temporary one-time id for a specific game run instance
  public readonly tid: string

  public constructor(tid: string) {
    this.tid = tid
  }

}


