import { Component, OnInit, AfterViewInit } from '@angular/core';
import { AppComponent } from '../app.component';
import { Router } from '@angular/router';
import { ChatService } from '../chat.service';
import { AuthService } from '../auth.service';
import { LobbyService } from '../lobby.service';

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
    private lobby: LobbyService
  ) { }

  ngOnInit(){
    this.refresh();
    this.lobbyListListen();
    this.clearErrors();
  };

  createNewLobby(){
    var newLobbyName = (<HTMLInputElement>document.getElementById("newRoom")).value;
    let exists = this.LobbyExists(newLobbyName);
    //console.log(exists)
    if (exists === true){
      this.existsError = true;
      //console.log(this.existsError)
      (<HTMLInputElement>document.getElementById("newRoom")).value = "";
    }else if(exists === false){
      var liTag = document.createElement("LI");
      liTag.classList.add("list-group-item", "bg-transparent");
      liTag.innerText = newLobbyName;
      (<HTMLInputElement>document.getElementById("newRoom")).value = "";
      document.getElementById("lobbyListParent").appendChild(liTag);
      this.auth.fetchUsername().subscribe(
        res =>{
          //sessionStorage.setItem('roomAlreadyJoined', 'false')
          let username = res['collectedUsername'];
          this.lobby.newRoom(newLobbyName, username).subscribe(
            res => {
              //console.log(res)
              this.chat.joinRoom(newLobbyName);
              sessionStorage.setItem('room', newLobbyName)
              this.chat.emitMessage({room: newLobbyName, message:" has entered the room", username: username})
              this.router.navigateByUrl(`/join/${newLobbyName}`)
              this.app.enableRoomNav(newLobbyName);
            },
            err => {console.log(err)}
          )
        },
        err => {
          console.log(err)
        }
      )
    };
  };

  lobbyListListen(){
      //buttons = document.querySelectorAll("button.lobbyList");
      const lobbyList = document.getElementById("lobbyListParent");
      lobbyList.addEventListener("click", (e)=>{
        this.DNEerror = false;
        this.existsError = false;
        let clicked = (<HTMLElement>e.target).textContent;
        (<HTMLInputElement>document.getElementById('existingRoom')).value = clicked;
      }, false);
    }; 

  LobbyExists(name){
    //console.log(name)
    let exists = false;
    const lobbyList = document.getElementById("lobbyListParent");
    //console.log(lobbyList.children.item(0).textContent)
    //console.log(lobbyList.childElementCount)
    for(let i=0; i<lobbyList.childElementCount; i++){
      //console.log('                    ')
      let existingName = lobbyList.children.item(i).textContent;
      //console.log(name, typeof(name))
      //console.log(existingName, typeof(existingName))
      if (existingName === name){
        //console.log("exists")
        exists = true;
      }
    }
    return exists
  }

  joinExisting(){
    let room = (<HTMLInputElement>document.getElementById('existingRoom')).value;
    let exists = this.LobbyExists(room);
    if(exists === true){
      this.auth.fetchUsername().subscribe(
        res =>{
          //sessionStorage.setItem('roomAlreadyJoined', 'false')
          let username = res['collectedUsername'];
          this.lobby.joinRoom(room, username).subscribe(
            res =>{
              //console.log(res)
              this.chat.joinRoom(room);
              this.app.enableRoomNav(room);
              this.chat.emitMessage({room: room, message:" has entered the room", username: username})
              this.router.navigateByUrl(`/join/${room}`)
            },
            err =>{
              console.log(err)
              this.DNEerror2 = true;
              (<HTMLInputElement>document.getElementById('existingRoom')).value = ""
              this.refresh();
              this.clearErrors();
            }
          )
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

/*    
          this.auth.fetchUsername().subscribe(
            res =>{
              this.chat.joinRoom(newLobbyName, res['collectedUsername']).subscribe(
                res =>{
                  console.log(res)
                },
                err => {
                  console.log(err)
                }
              )
            },
            err =>{
              console.log(err)
            }
          )
    
*/