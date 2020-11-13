import { Component, OnDestroy, OnInit, AfterViewInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AppComponent } from '../app.component';
import { AuthService } from '../auth.service';
import { ChatService } from '../chat.service';
import { LobbyService } from '../lobby.service';

@Component({
  selector: 'app-join',
  templateUrl: './join.component.html',
  styleUrls: ['./join.component.css']
})
export class JoinComponent implements OnInit, OnDestroy, AfterViewInit {

  username: string;
  clicked = false;
  messageErr = false;
  message: string;
  subscription1$: Subscription;
  constructor(
    private auth: AuthService,
    private app: AppComponent,
    private chat: ChatService,
    private lobby: LobbyService,
    private router: Router
  ) { }

  ngOnInit(): void {
    //console.log("on init executed")
    this.validate();
    this.subscription1$ = this.chat.listen("message").subscribe((data) => this.recievedMessage(data));
    //console.log(this.subscription1$);
    //window.onbeforeunload = () => this.ngOnDestroy();
  }

  ngAfterViewInit(): void{
    //console.log("view init executed")
    const messagebar = document.getElementById("message");
    //console.log(messagebar)
    messagebar.addEventListener("keypress", (e) => {
      if (e.key === "Enter"){
        console.log("Enter key pressed")
        this.sendMessage();
      }
    }, false)
  }

  ngOnDestroy(): void{
    //console.log("on destroy executed")
    let room = sessionStorage.getItem('room')
    this.chat.emitMessage({room: room, message: "Is no longer active and cannot see any of the messages.", username: this.username});
    this.subscription1$.unsubscribe();
   //console.log(this.subscription1$);
  }


  listenForMessages(){
    sessionStorage.setItem("listening", "true")
  }

  validate(){ 
    if (this.auth.userDataPresent()){
      this.auth.verifyCredentials().subscribe(
          res =>{
            if (res === true){
              this.username = localStorage.getItem('username');
            }else{
              this.app.logout();
            }
          },
          err =>{
            console.log(err);
            this.app.logout();
            alert("Error: You have been logged out.")
          }
        )
    }else{
      this.app.logout();
    }
  };

  sendMessage(){ 
    if(this.message === undefined){
      this.messageErr = true;
    }else if(this.message === null){
      this.messageErr = true;
    }else{
      this.messageErr = false;
      this.message = " " + this.message
      if (this.auth.userDataPresent()){
        this.auth.verifyCredentials().subscribe(
          res =>{
            if (res === true){
              this.lobby.findRoom(localStorage.getItem('username')).subscribe(
                res=>{
                  var data = res['data'];
                  this.chat.emitMessage({room: data.room, message: this.message, username: this.username});
                  this.message = null;
                },
                err=>{console.log(err)}
              )
            }else{
              this.app.logout()
            }
          },
          err =>{
            console.log(err);
            this.app.logout();
          }
        )
      }else{
        this.app.logout();
      }
    };
  };

  recievedMessage(data: any): void {
    //console.log("RM called")
    let display = document.getElementById('displayMessages');
    let span = document.createElement("span");
    span.classList.add("d-block", "rounded-pill", "p-1", "my-1", "bg-info", "text-dark")
    span.innerText = data;
    //console.log(span)
    display.appendChild(span);
  };
}