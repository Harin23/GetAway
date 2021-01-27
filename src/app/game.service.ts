import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ChatService } from './chat.service';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  private shuffleURL = "http://localhost:3000/gamedata/shuffle";
  private getCardsURL = "http://localhost:3000/gamedata/getgameinfo";
  private throwCardsURL = "http://localhost:3000/gamedata/throwcard";
  private cardCountURL = "http://localhost:3000/gamedata/getcardcount";

  private socket: any;

  constructor(
    private http: HttpClient,
    private chat: ChatService
  ) {
    this.socket = this.chat.getSocket();
  }

  //db methods
  shuffle(room: string){
    console.log(room)
    let roomInfo = { room: room }
    return this.http.post(this.shuffleURL, roomInfo, {responseType: 'text'});
  };

  getGameInfo(){
    return this.http.post(this.getCardsURL, {responseType: 'json'})
  }

  getCardImage(card: string){
    var cardImage = new Image();
    let src = "../../assets/PNG/" + card + ".png";
    cardImage.src = src
    return cardImage;
  }

  throwCard(data: object){
    return this.http.post(this.throwCardsURL, data, {responseType: 'json'})
  }

  getCardCount(data: object){
    return this.http.post(this.cardCountURL, data, {responseType: 'json'})
  }

  //socket-io

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

  onTable(data: any){
    // console.log(this.socket, data)
    this.socket.emit("throwCard", data);
  };

}
