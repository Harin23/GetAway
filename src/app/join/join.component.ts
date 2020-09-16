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
  constructor(
    private auth: AuthService,
    private app: AppComponent,
    private chat: ChatService
  ) { }

  ngOnInit(): void {
    this.validate();
    this.listenForMessages();
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
    this.chat.emitMessage({room: "1", message: "yo", username: this.username})
  }

  listenForMessages(){
    this.chat.listen('message').subscribe(
      (res: any) =>{
        console.log("res recieved")
        console.log(res)
      }
    )
  }
}
