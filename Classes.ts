import { Server, Socket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { io as client_io } from "socket.io-client";

export class Environment {

  private readonly server: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;
  private rcas_codes: Map<string, string>
  private ctrlrs_codes: Map<string, Array<string>>
  private ctrlrs_ids: Map<string, string>
  private ctrlrs_rcas: Map<string, string>

  constructor(server: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) {
    this.server = server
    this.rcas_codes = new Map<string, string>()
    this.ctrlrs_ids = new Map<string, string>()
    this.ctrlrs_rcas = new Map<string, string>()
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

          if (target_rca)
            this.server.sockets.in(target_rca).emit('accept_controller?', socket.id)
        }
      })

      socket.on('accept_controller_response', (ctrlr_socket_id, response, temp_id) => {
        console.log('RESPONSE', response)
        if (response == true) {
          this.ctrlrs_ids.set(ctrlr_socket_id, temp_id)
          this.ctrlrs_rcas.set(ctrlr_socket_id, socket.id)

        }
        this.server.sockets.in(ctrlr_socket_id).emit('accept_controller_response', response)
      })

      socket.on('control', (control_info: any) => {
        this.ctrlrs_codes.get(socket.id)
        console.log(this.ctrlrs_rcas)

        const target_rca = this.ctrlrs_rcas.get(socket.id)
        const id = this.ctrlrs_ids.get(socket.id)
        console.log('control', id, control_info)
        if (target_rca)
          this.server.sockets.in(target_rca).emit('control', id, control_info)

      })

      socket.on('message', (message: any, id: (string | undefined)) => {

        for (const ctrlr in this.ctrlrs_ids.keys()) {
          //check if sent to that id (include all if id is undefined) AND if this ctrlr socket corresponds to this RCA socket
          if ((!id || this.ctrlrs_ids.get(ctrlr) == id) && this.ctrlrs_rcas.get(ctrlr) == socket.id)
            this.server.sockets.in(ctrlr).emit('message', message)
        }



      })
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

    this.socket.on('accept_controller?', (ctrlr_socket_id: string) => {
      console.log('accept?')
      this.socket.emit('accept_controller_response', ctrlr_socket_id, this.acceptNewController(), this.generateTempId())
    })

    this.socket.on('control', (ctrlr_id: string, action_info: any) => {
      console.log('ACTION RECEIVED')
      this.onAction(ctrlr_id, action_info)
    })

  }
  public abstract onAction(source_temp_id: string, action_info: any): void
  public abstract generateTempId(): string

  public getSocket(): Socket<DefaultEventsMap, DefaultEventsMap> { return this.socket }

  //commonly waiting for the required number of controllers registered, maybe something else...
  public abstract checkStartCondition(EnvironmentContext: Environment): Boolean
  public abstract acceptNewController(): Boolean

  public sendMessage(message: any, ctrlr_temp_id: (string | undefined) = undefined) {
    this.socket.emit('message', message, ctrlr_temp_id)
  }

}

export abstract class Controller {
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

    this.socket.on('accept_controller_response', (response: boolean) => {
      console.log('accept ctrlr?', response)
    })

    this.socket.on('message', (message: any) => {
      this.onMessageReceived(message)
    })

  }
  public abstract onMessageReceived(message: any) : void

  public tryConnecting(auth_code: string): void {
    this.socket.emit('ctrlr_connection_request', auth_code)
  }
  public sendControl(control_info: any) {
    this.socket.emit('control', control_info)
  }
}



