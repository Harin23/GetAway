import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import * as io from "socket.io-client";

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  
  private lobbyURL = "http://localhost:3000/lobby";
  private socket: any;

  constructor( 
   ) { 
     this.socket = io(this.lobbyURL);
  };

  joinRoom(room: string){
    this.socket.emit("join_room", room);
  };

  listen(eventName: string) : Observable<any>{
    return new Observable((Subscribe) =>{
      this.socket.on(eventName, (data) =>{
        Subscribe.next(data);
      })
    })
  };

  emitMessage(data: object){
    this.socket.emit("sendMessage", data);
  };

  getSocket(){
    return this.socket;
  }
}
