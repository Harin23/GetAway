import { Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from './auth.service';
import { ChatService } from './chat.service';
import { LobbyService } from './lobby.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent {
  title = 'GetAway';

  constructor(
    private _auth: AuthService,
    private router: Router,
    private lobby: LobbyService,
    private chat: ChatService
  ) {}

  ngOnInit(): void {
    this.UserAlreadySignedIn();
  }

  removeLoginRegister = false;
  usernameDisplay = "";

  UserAlreadySignedIn(){
    if (this._auth.userDataPresent()){
      this._auth.verifyCredentials().subscribe(
        res =>{
          if (res === true){
            this.displayUsername();
            this.lobby.findRoom(localStorage.getItem('username')).subscribe(
              res=>{
                //console.log(res['data'])
                var data = res['data'];
                if(data === false){
                  this.disableRoomNav()
                }else{
                  this.enableRoomNav(data.room)
                }
              },
              err=>{console.log(err)}
            )
          }else{
            this.removeLoginRegister = this._auth.logOut();
          }
        },
        err =>{
          console.log(err);
          this.removeLoginRegister = this._auth.logOut();
        }
      )
    }else{
      this.removeLoginRegister = this._auth.logOut();
    }
  };

  displayUsername(){
    this.removeLoginRegister = true;
    this.usernameDisplay = localStorage.getItem('username');
  };

  logout(){
    if (this._auth.userDataPresent()){
      console.log("1"+true)
      this._auth.verifyCredentials().subscribe(
        res =>{
          if (res === true){
            console.log("2"+true)
            var username = localStorage.getItem('username');
            this.lobby.findRoom(username).subscribe(
              res=>{
                var data = res['data'];
                this.lobby.leaveRoom(data.room, username).subscribe(
                  res=>{
                    console.log(res)
                    this.leftTheChat(data.room, username);
                    this.disableRoomNav();
                  },
                  err=>{console.log(err)}
                )
                this.removeLoginRegister = this._auth.logOut();
              },
              err=>{
                console.log(err)
                this.removeLoginRegister = this._auth.logOut();
              }
            )
          }
        },
        err=>{
          console.log(err)
          this.removeLoginRegister = this._auth.logOut();
        }
      )
    }else{
      this.removeLoginRegister = this._auth.logOut();
    }

  };

  roomUsers(){
    let roomInfo = sessionStorage.getItem('room');
    //console.log(roomInfo)
    document.getElementById("users").innerHTML="";
    this.lobby.fetchUsers(roomInfo).subscribe(
      res=>{
        //console.log(res)
        let i = 0;
        res['users'].forEach((element: string) => {
          var liTag = document.createElement("LI");
          liTag.innerText = element;
          document.getElementById("users").appendChild(liTag);
          //console.log(++i);
        })
      },
      err=>{console.log(err)}
    )
  };

  roomNav(){
    let roomJoined = sessionStorage.getItem('roomJoined')
    if (roomJoined === "true"){
      this.roomUsers()
      let joinedRoom = sessionStorage.getItem('room')
      this.router.navigateByUrl(`/join/${joinedRoom}`)
    }
  }

  enableRoomNav(room: string){
    sessionStorage.setItem('room', room)
    sessionStorage.setItem('roomJoined', 'true');
    let roomNav = document.getElementById("room");
    roomNav.classList.remove("disabled");
    let lobbyNav = document.getElementById("lobby");
    lobbyNav.classList.add("disabled");
  }

  disableRoomNav(){
    sessionStorage.removeItem('room')
    sessionStorage.setItem('roomJoined', 'false');
    let roomNav = document.getElementById("room");
    roomNav.classList.add("disabled");
    let lobbyNav = document.getElementById("lobby");
    lobbyNav.classList.remove("disabled");
  }

  leave(){
    let room = sessionStorage.getItem('room')
    this.disableRoomNav();
    this._auth.fetchUsername().subscribe(
      res=>{
        let username = res['collectedUsername'];
        this.lobby.leaveRoom(room, username).subscribe(
          res=>{
            //console.log(res)
            this.leftTheChat(room, username)
          },
          err=>{console.log(err)}
        )
      },
      err=>{console.log(err)}
    )
    this.router.navigate(['/host'])
  };

  leftTheChat(room: string, username: string){
    this.chat.emitMessage({room: room, message: " has left the room", username: username})
  };
}
