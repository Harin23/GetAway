import { Component, ViewEncapsulation } from '@angular/core';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent {
  title = 'GetAway';

  constructor(
    private _auth: AuthService
  ) {}

  ngOnInit(): void {
    this.UserAlreadySignedIn();
  }

  removeLoginRegister = false;
  usernameDisplay = "";

  UserAlreadySignedIn(){
    if (this._auth.userDataPresent()){
      this._auth.verifyCredentials()
      .subscribe(
        res =>{
          if (res === true){
            this.displayUsername();
          }else{
            this.logout();
          }
        },
        err =>{
          console.log(err);
          this.logout();
        }
      )
    }else{
      this.logout();
    }
  }

  displayUsername(){
    this.removeLoginRegister = true;
    this.usernameDisplay = localStorage.getItem('username');
  }

  logout(){
    this.removeLoginRegister = this._auth.logOut();
  }
}
