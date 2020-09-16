import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import * as io from "socket.io-client";

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  
  lobbyURL = "http://localhost:3000/lobby";
  socket: any;
  constructor(  ) { 
     this.socket = io(this.lobbyURL);
  }

  joinRoom(room: string){
    this.socket.emit("join_room", room);
  };

  listen(event: string){
    return new Observable((subscriber) =>{
      this.socket.on(event, (data) =>{
        subscriber.next(data);
      });
    });
  };

  emitMessage(data){
    this.socket.emit("sendMessage", data);
  }

}
