import { Injectable } from '@angular/core';
import { observable, Observable, Subscriber } from 'rxjs';
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

  listen(eventName: string) : Observable<any>{
    return new Observable((Subscribe) =>{
      this.socket.on(eventName, (data) =>{
        Subscribe.next(data);
      })
    })
  };

  emitMessage(data){
    this.socket.emit("sendMessage", data);
  }

}

/*     

return new Observable((subscriber) =>{
      this.socket.on(event, (data) =>{
        subscriber.next(data);
      });
    });
    
    
    
*/