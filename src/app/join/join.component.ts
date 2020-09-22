import { Component, OnInit } from '@angular/core';
import { AppComponent } from '../app.component';
import { AuthService } from '../auth.service';
import { ChatService } from '../chat.service';

@Component({
  selector: 'app-join',
  templateUrl: './join.component.html',
  styleUrls: ['./join.component.css']
})
export class JoinComponent implements OnInit {

  username: string;
  clicked = false;
  messageErr = false;
  message: string;
  constructor(
    private auth: AuthService,
    private app: AppComponent,
    private chat: ChatService
  ) { }

  ngOnInit(): void {
    this.validate();
    this.chat.listen("message").subscribe((data) => this.recievedMessage(data));
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
  }

  sendMessage(){
    if(this.message === undefined){
      this.messageErr = true;
    }else if(this.message === null){
      this.messageErr = true;
    }else{
      this.messageErr = false;
      this.chat.emitMessage({room: "1", message: this.message, username: this.username});
      this.message = null;
    };
  
  }

  recievedMessage(data: any): void {
    let display = document.getElementById('displayMessages');
    let span = document.createElement("span");
    span.classList.add("d-block", "rounded-pill", "p-1", "my-1", "bg-info", "text-dark")
    span.innerText = data;
    console.log(span)
    display.appendChild(span);
  }
}
