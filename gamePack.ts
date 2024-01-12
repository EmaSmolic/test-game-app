import { Server, Socket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { io as client_io } from "socket.io-client";

export class GamePack {

  private readonly server: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;
  private controllers: Array<Controller>
  private codeGamesocketid: Map<string,string> 
  private codeCtrlrsocketid: Map<string,Array<string>> 

  constructor(server: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) {
    this.server = server
    this.controllers = []
    this.codeGamesocketid = new Map<string,string>()
    this.codeCtrlrsocketid = new Map<string,Array<string>>()

    this.server.on('connection', (socket)  => {
      console.log('connected', socket.id)
      this.server.emit('hi')

      socket.on('hello_from_game' , (code) => {
        console.log('GAME', socket.id, socket.handshake.address, code)
        this.codeGamesocketid.set(code, socket.id)
      })
      socket.on('hello_from_ctrlr' , (code) => {
        if(!this.codeGamesocketid.get(code)) socket.emit('reject')
        var codeCtrlrs = this.codeCtrlrsocketid.get(code)

        if (!codeCtrlrs) codeCtrlrs = []
        codeCtrlrs.concat([socket.id])

        this.codeCtrlrsocketid.set(code, codeCtrlrs)

        console.log('CONTROLLER', socket.id, 'connected to game socket', this.codeGamesocketid.get(code), this.codeGamesocketid)
        socket.emit("accept")
      })

    });

    this.server.on('disconnect', () => {
      this.server.removeAllListeners();
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
  private readonly socket: any
  private readonly code : string

  constructor(serverAddress: string, code : string) {
    this.code = code
    //game socket
    var connectionOptions = {
      timeout: 10000, //before connect_error and connect_timeout are emitted.
      transports: ["websocket"],
      "force new connection": false,
    };
    this.socket = client_io(serverAddress, connectionOptions);

    //register as a game at env server
    this.socket.on('hi', () => {
      console.log('hello', this.socket.id)
      this.socket.emit('hello_from_game', this.code)
    })
  }

  public getSocket(): Socket<DefaultEventsMap, DefaultEventsMap> { return this.socket }

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


