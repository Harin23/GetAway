import { Component, OnInit } from '@angular/core';
import { AppComponent } from '../app.component';
import { Router } from '@angular/router';
import { ChatService } from '../chat.service';
import { AuthService } from '../auth.service';
import { LobbyService } from '../lobby.service';
import { GameService } from '../game.service';

@Component({
  selector: 'app-host',
  templateUrl: './host.component.html',
  styleUrls: ['./host.component.css']
})
export class HostComponent implements OnInit {

  userCredentials = null;
  existsError = false;
  DNEerror = false;
  DNEerror2 = false;
  constructor(
    private app: AppComponent,
    private router: Router,
    private auth: AuthService,
    private chat: ChatService,
    private lobby: LobbyService,
    private game: GameService
  ) { }

  ngOnInit(){
    this.refresh();
    this.selectRoom();
    this.clearErrors();
  };

  joinedRoom(room: string, name: string){
    this.chat.joinRoom(room);
    sessionStorage.setItem('room', room)
    this.app.enableRoomNav(room);
    this.chat.emitMessage({room: room, message:" has entered the room", username: name})
    this.router.navigateByUrl(`/join/${room}`)
  }

  shuffleCards(room: string){
    this.game.shuffle(room).subscribe(
      res=>{console.log(res)},
      err=>{console.log(err)}
    )
  }

  createNewLobby(){
    var newRoomName = (<HTMLInputElement>document.getElementById("newRoom")).value;
    let exists = this.LobbyExists(newRoomName);
    if (exists === true){
      this.existsError = true;
      (<HTMLInputElement>document.getElementById("newRoom")).value = "";
    }else if(exists === false){
      var liTag = document.createElement("LI");
      liTag.classList.add("list-group-item", "bg-transparent");
      liTag.innerText = newRoomName;
      (<HTMLInputElement>document.getElementById("newRoom")).value = "";
      document.getElementById("lobbyListParent").appendChild(liTag);
      this.lobby.newRoom(newRoomName).subscribe(
        res => {
          let name=res["name"]
          this.shuffleCards(newRoomName)
          this.joinedRoom(newRoomName, name);
        },
        err => {console.log(err)}
      )
    };
  };

  selectRoom(){
      const lobbyList = document.getElementById("lobbyListParent");
      lobbyList.addEventListener("click", (e)=>{
        this.DNEerror = false;
        this.existsError = false;
        let clicked = (<HTMLElement>e.target).textContent;
        (<HTMLInputElement>document.getElementById('existingRoom')).value = clicked;
      }, false);
    }; 

  LobbyExists(name: string){
    let exists = false;
    const lobbyList = document.getElementById("lobbyListParent");
    for(let i=0; i<lobbyList.childElementCount; i++){
      let existingName = lobbyList.children.item(i).textContent;
      if (existingName === name){
        exists = true;
      }
    }
    return exists
  }

  joinExisting(){
    let room = (<HTMLInputElement>document.getElementById('existingRoom')).value;
    let exists = this.LobbyExists(room);
    if(exists === true){
          this.lobby.joinRoom(room).subscribe(
            res =>{
              console.log(res)
              let name = res["name"]
              this.joinedRoom(room, name)
            },
            err =>{
              console.log(err)
              this.DNEerror2 = true;
              (<HTMLInputElement>document.getElementById('existingRoom')).value = ""
              this.refresh();
              this.clearErrors();
            }
          )
    }else{
      this.DNEerror = true;
      (<HTMLInputElement>document.getElementById('existingRoom')).value = "";
    }
  };

  clearErrors(){
    document.getElementById('existingRoom').addEventListener("click", (e) =>{
      this.DNEerror = false;
      this.existsError = false; 
      this.DNEerror2 = false;
    }, false);
    document.getElementById("newRoom").addEventListener("click", (e) =>{
      this.DNEerror = false;
      this.existsError = false; 
      this.DNEerror2 = false;
    }, false);
  };

  refresh(){
    document.getElementById("lobbyListParent").innerHTML="";
    this.lobby.refreshList().subscribe(
      res =>{
        res['room'].forEach(element => {
          var liTag = document.createElement("LI");
          liTag.classList.add("list-group-item", "bg-transparent");
          liTag.innerText = element.room;
          document.getElementById("lobbyListParent").appendChild(liTag);
        });
      },
      err => {console.log(err)}
    )
  }
}