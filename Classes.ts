import { Server, Socket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { io as client_io } from "socket.io-client";

export class Environment {

  private readonly server: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;
  private controllers: Array<Controller>
  private rcas_codes: Map<string, string>
  private ctrlrs_codes: Map<string, Array<string>>

  constructor(server: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) {
    this.server = server
    this.controllers = []
    this.rcas_codes = new Map<string, string>()
    this.ctrlrs_codes = new Map<string, Array<string>>()

    this.server.on('connection', (socket) => {
      this.server.emit('hi')

      socket.on('rca_connection', (auth_code) => {
        console.log('RCA', socket.id, socket.handshake.address, auth_code)
        this.rcas_codes.set(auth_code, socket.id)
      })

      socket.on('ctrlr_connection_request', async (auth_code) => {
        console.log('CTRLR', socket.id, socket.handshake.address, auth_code)

        console.log(this.rcas_codes)
        //PRIMJER SLOŽENIJEG SLUČAJA ZA DIJAGRAM KOMUNIKACIJE
        if (!this.rcas_codes.get(auth_code)) {
          console.log('rejecting')
          socket.emit('reject')
        }
        else {
          var codeCtrlrs = this.ctrlrs_codes.get(auth_code)

          if (!codeCtrlrs) codeCtrlrs = []
          codeCtrlrs.concat([socket.id])

          this.ctrlrs_codes.set(auth_code, codeCtrlrs)

          //target RCA exists
          const target_rca = this.rcas_codes.get(auth_code)
          
          if (target_rca) this.server.sockets.in(target_rca).emit('accept_controller?')
        }
      })

      socket.on('accept_controller_response', (response) => console.log('RESPONSE', response))

    });


    this.server.on('disconnect', () => {
      this.server.removeAllListeners();
    });

  }

}

export abstract class RCA {
  private readonly socket: any
  private readonly code: string

  constructor(serverAddress: string, code: string) {
    this.code = code
    //RCA socket
    var connectionOptions = {
      timeout: 10000, //before connect_error and connect_timeout are emitted.
      transports: ["websocket"],
      "force new connection": false,
    };
    this.socket = client_io(serverAddress, connectionOptions);

    //register as a RCA at env server
    this.socket.on('hi', () => {
      this.socket.emit('rca_connection', this.code)
    })

    this.socket.on('accept_controller?', () => {
      console.log('accept?')
      this.socket.emit('accept_controller_response', false)
    })
  }

  public getSocket(): Socket<DefaultEventsMap, DefaultEventsMap> { return this.socket }

  //commonly waiting for the required number of controllers registered, maybe something else...
  public abstract checkStartCondition(EnvironmentContext: Environment): Boolean
  public abstract acceptNewController(EnvironmentContext: Environment): Boolean


}

export class Controller {
  private readonly socket: any

  public constructor(serverAddress: string) {
    var connectionOptions = {
      timeout: 10000, //before connect_error and connect_timeout are emitted.
      transports: ["websocket"],
      "force new connection": false,
    };
    this.socket = client_io(serverAddress, connectionOptions);

    //register as a Controller at env server
    this.socket.on('hi', () => {
      console.log('hello', this.socket.id)

    })
  }

  public tryConnecting(auth_code: string): boolean{

    this.socket.emit('ctrlr_connection_request', auth_code)

    return false
  }
}



