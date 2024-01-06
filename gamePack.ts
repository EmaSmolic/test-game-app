import { Socket } from 'socket.io';
export class GamePack {
  private readonly socket: Socket;
  private readonly game: Game;
  private controllers: Array<Controller>

  constructor(socket:Socket, game:Game) {
    this.socket = socket
    this.game = game
    this.controllers = []

    //subscribe game to socket
    this.socket.on('connection', client => {
      console.log('connection')
      //client.on('event', data => { /* … */ });
    });

    //subscribe to controller web service opening
  }

  //returns true if controller connected, false in case of controller rejection
  private onControllerServiceOpened() : Boolean {
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

  //commonly waiting for the required number of controllers registered, maybe something else...
  public abstract checkStartCondition(gamePackContext : GamePack) : Boolean
  public abstract acceptNewController(gamePackContext : GamePack) : Boolean
  public abstract generateTid(gamePackContext : GamePack) : string


}

class Controller {
  //temporary one-time id for a specific game run instance
  public readonly tid : string

  public constructor(tid : string) {
    this.tid = tid
  }

}


