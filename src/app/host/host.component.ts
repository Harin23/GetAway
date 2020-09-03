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
  constructor(
    private _app: AppComponent,
    private _router: Router,
    private auth: AuthService
    //private chat: ChatService
  ) { }

  ngOnInit(){
    this.validate();
  }

  validate(){ 
    if (this.auth.userDataPresent()){
      this.auth.verifyCredentials()
        .subscribe(
          res =>{
            if (res === true){
              this.username = localStorage.getItem('username');
            }else{
              this._app.logout();
            }
          },
          err =>{
            console.log(err);
            this._app.logout();
            alert("Error: You have been logged out.")
          }
        )
    }else{
      this._app.logout();
    }
  }
}
