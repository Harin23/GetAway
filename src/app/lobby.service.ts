import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LobbyService {

  private lobbyCreateURL = "http://localhost:3000/lobbydata/create";
  private lobbyJoinURL = "http://localhost:3000/lobbydata/join";
  private lobbyDeleteURL = "http://localhost:3000/lobbydata/delete";
  private lobbyUpdateURL = "http://localhost:3000/lobbydata/update";
  private fetchUsersURL = "http://localhost:3000/lobbydata/users";
  private leaveRoomURL = "http://localhost:3000/lobbydata/leave";
  private findRoomURL = "http://localhost:3000/lobbydata/find";

  constructor(
    private http: HttpClient
  ) { }

  newRoom(room: string){
    //console.log('request sent')
    let roomInfo = {room: room}
    return  this.http.post(this.lobbyCreateURL, roomInfo, {responseType: 'json'});
  };

  joinRoom(room: string){
    let roomInfo = {room: room}
    return this.http.post(this.lobbyJoinURL, roomInfo, {responseType: 'json'});
  };

  refreshList(){
    return this.http.get(this.lobbyUpdateURL, {responseType: 'json'});
  };

  fetchUsers(roomInfo: string){
    return this.http.post(this.fetchUsersURL, {room: roomInfo}, {responseType: 'json'})
  };

  leaveRoom(room: string, username: string){
    let roomInfo = {room: room, users: username}
    return this.http.post(this.leaveRoomURL, roomInfo, {responseType: 'json'});
  };

  findRoom(username: string){
    return this.http.post(this.findRoomURL, {username: username}, {responseType: 'json'});
  }

  deleteRoom(room: string){
    return this.http.post(this.lobbyDeleteURL, room, {responseType: 'json'})
  };
}
