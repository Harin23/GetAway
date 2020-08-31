import { Injectable } from '@angular/core';
import * as io from "socket.io-client";

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  
  private lobby = io("http://localhost:3000/lobby");
  constructor(  ) { }


}
