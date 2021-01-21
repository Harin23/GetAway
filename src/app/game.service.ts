import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  private shuffleURL = "http://localhost:3000/gamedata/shuffle";
  private getCardsURL = "http://localhost:3000/gamedata/getcards";
  constructor(
    private http: HttpClient
  ) {}

  shuffle(room: string){
    let roomInfo = { room: room }
    return this.http.post(this.shuffleURL, roomInfo, {responseType: 'text'});
  };

  getCards(room: string, username: string){
    let info = {room: room, name: username}
    return this.http.post(this.getCardsURL, info, {responseType: 'json'})
  }

  cardImages(card: string){
    var cardImage = new Image();
    let src = "../../assets/PNG/" + card + ".png";
    cardImage.src = src
    return cardImage;
  }
}
