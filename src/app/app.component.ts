import { Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
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
    private auth: AuthService,
    private router: Router,
    private lobby: LobbyService,
    private chat: ChatService, 
  ) {}

  ngOnInit(): void {
    this.UserAlreadySignedIn();
  }

  removeLoginRegister = false;
  usernameDisplay = "";

  UserAlreadySignedIn(){
    console.log(this.auth.userDataPresent())
    if (this.auth.userDataPresent()){
      this.auth.verifyCredentials().subscribe(
        res =>{
          let userInRoom = res["exists"]
          let username = res["name"]
          localStorage.setItem("username", username);
          this.displayUsername();
          if(userInRoom === false){
            this.disableRoomNav()
          }else{
            let room = res["room"]
            this.enableRoomNav(room)
          }
        },
        err =>{
          console.log(err);
          this.removeLoginRegister = this.auth.logOut();
        }
      )
    }else{
      console.log("log out")
      this.removeLoginRegister = this.auth.logOut();
    }
  };

  displayUsername(){
    let name = localStorage.getItem("username")
    this.removeLoginRegister = true;
    this.usernameDisplay = name;
  };

  roomUsers(){
    document.getElementById("users").innerHTML="";
    this.lobby.fetchUsers().subscribe(
      res=>{
        res['users'].forEach((element: string) => {
          var liTag = document.createElement("LI");
          liTag.innerText = element;
          document.getElementById("users").appendChild(liTag);
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

  leftTheChat(room: string, username: string){
    this.chat.emitMessage({room: room, message: " has left the room", username: username})
  };

  getNavbar(){
    var element = document.getElementById("navbarElement");
    return element.getBoundingClientRect();
  }

  leave(){
    this.disableRoomNav();
    if (this.auth.userDataPresent()){
      this.lobby.leaveRoom().subscribe(
        res=>{
          console.log(res)
          let username = res["name"];
          let room = res["room"];
          this.leftTheChat(room, username);
          this.disableRoomNav();
        },
        err=>{console.log(err)}
      )
    }else{
      this.removeLoginRegister = this.auth.logOut();
    }
    this.router.navigate(['/host'])
  };

  logout(){
    this.leave();
    this.removeLoginRegister = this.auth.logOut();
  };
}
