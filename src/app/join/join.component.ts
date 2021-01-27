import { Component, OnDestroy, OnInit, AfterViewInit } from '@angular/core';
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
  messageErr = false;
  message: string;
  subscription1$: Subscription;
  constructor(
    private auth: AuthService,
    private chat: ChatService,
    private app: AppComponent
  ) { }

  ngOnInit(): void {
    this.app.UserAlreadySignedIn();
    this.auth.getUserInfo().subscribe(
      res=>{
        let room = res["room"];
        this.username = res["name"]
        this.chat.joinRoom(room);
      },
      err=>{console.log(err)}
    );
  }

  ngAfterViewInit(): void{
    this.subscription1$ = this.chat.listen("message").subscribe((data) => this.recievedMessage(data));

    const messagebar = document.getElementById("message");

    messagebar.addEventListener("keypress", (e) => {
      if (e.key === "Enter"){
        console.log("Enter key pressed")
        this.sendMessage();
      }
    }, false)
  }

  ngOnDestroy(): void{
    let room = sessionStorage.getItem('room')
    this.chat.emitMessage({room: room, message: "Is no longer active and cannot see any of the messages.", username: this.username});
    this.subscription1$.unsubscribe();
  }

  sendMessage(){ 
    if(this.message === undefined){
      this.messageErr = true;
    }else if(this.message === null){
      this.messageErr = true;
    }else{
      this.messageErr = false;
      this.message = " " + this.message
      this.auth.getUserInfo().subscribe(
        res=>{
          console.log(res)
          let room=res["room"], name=res["name"];
          this.chat.emitMessage({room: room, message: this.message, username: name});
          this.message = null;
        },
        err=>{console.log(err)}
      )
    };
  };

  recievedMessage(data: any): void {
    let display = document.getElementById('displayMessages');
    let span = document.createElement("span");
    span.classList.add("d-block", "rounded-pill", "p-1", "my-1", "bg-info", "text-dark")
    span.innerText = data;
    display.appendChild(span);
  };
}