import { Server, Socket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { io as client_io } from "socket.io-client";

export class GamePack {

  private readonly serverSocket: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;
  private controllers: Array<Controller>

  constructor(serverSocket: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) {
    this.serverSocket = serverSocket
    this.controllers = []

    this.serverSocket.on('connection', client => {
      console.log('connected', client.id)
      this.serverSocket.sockets.emit("hi", "everyone");

      this.serverSocket.on('hello_from_game' ,(client, data)=>console.log(client))

      //this.socket.to(id).emit("my message", msg);
    });

    //subscribe to controller web service opening
  }


  //returns true if controller connected, false in case of controller rejection
  private onControllerServiceOpened(): Boolean {
    //return if rejected
    //if (!acceptNewController(this)) return false

    //init new Controller with unique one-time temporary id
   // const ctrlrTid = generateTid(this)
   // const ctrlr = new Controller(ctrlrTid)

    //save it to controllers
  //  this.controllers.push(ctrlr)
    return true

  }

  public getControllers() {
    return this.controllers
  }

}

export abstract class Game {
  private readonly clientSocket: any


  constructor(serverAddress: string) {
    //game socket
    var connectionOptions = {
      timeout: 10000, //before connect_error and connect_timeout are emitted.
      transports: ["websocket"],
      autoConnect: false
    };
    var clientSocket = client_io(serverAddress, connectionOptions);
    this.clientSocket = clientSocket

    this.clientSocket.connect()
    //register as a game at env server
    this.clientSocket.emit('hello_from_game',this.clientSocket, )
  }

  public getSocket(): Socket<DefaultEventsMap, DefaultEventsMap> { return this.clientSocket }

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


