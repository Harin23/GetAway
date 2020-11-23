import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  private startURL = "http://localhost:3000/gamedata/start"
  constructor(
    private http: HttpClient
  ) {}

  start(room: string){
    let roomInfo = { room: room }
    return this.http.post(this.startURL, roomInfo, {responseType: 'text'});
  };
}
