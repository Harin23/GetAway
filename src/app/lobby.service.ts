import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LobbyService {

  private lobbyCreateURL = "http://localhost:3000/lobbydata/create";
  private lobbyJoinURL = "http://localhost:3000/lobbydata/join";
  private lobbyUpdateURL = "http://localhost:3000/lobbydata/update";
  private fetchUsersURL = "http://localhost:3000/lobbydata/users";
  private leaveRoomURL = "http://localhost:3000/lobbydata/leave";
  private clearLobbyURL = "http://localhost:3000/lobbydata/deleteall"

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

  fetchUsers(){
    return this.http.post(this.fetchUsersURL, {responseType: 'json'})
  };

  leaveRoom(){
    return this.http.post(this.leaveRoomURL, {responseType: 'json'});
  };

  clearLobby(){
    return this.http.post(this.clearLobbyURL, {responseType: 'json'})
  }

  userInRoom(){
    if(sessionStorage.getItem("roomJoined") === "false"){
      return false;
    }else{
      return true;
    }
  }
}
