import { Component, OnInit, AfterViewInit } from '@angular/core';
import { AppComponent } from '../app.component';
import { Router } from '@angular/router';
import { ChatService } from '../chat.service';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-host',
  templateUrl: './host.component.html',
  styleUrls: ['./host.component.css']
})
export class HostComponent implements OnInit {

  username = "";
  userCredentials = null;
  existsError = false;
  DNEerror = false;
  constructor(
    private _app: AppComponent,
    private _router: Router,
    private auth: AuthService,
    private chat: ChatService
  ) { }

  ngOnInit(){
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
      this.chat.joinRoom(newLobbyName);
    }else{
      //bug
    }
    
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
      this.chat.joinRoom(room);
    }else{
      this.DNEerror = true;
      (<HTMLInputElement>document.getElementById('existingRoom')).value = "";
    };
  };

  clearErrors(){
    document.getElementById('existingRoom').addEventListener("input", (e) =>{
      this.DNEerror = false;
      this.existsError = false; 
    }, false);
    document.getElementById("newRoom").addEventListener("click", (e) =>{
      this.DNEerror = false;
      this.existsError = false; 
    }, false);
  };
};

/*    

    this.chat.listen('welcome').subscribe(
      res =>{
        console.log(res)
      },
      err =>{
        console.log(err);
      }
    )
    
*/