import { Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
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
    private _auth: AuthService,
    private router: Router
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

  enableRoomNav(joinedRoom){
    let navButton = document.getElementById("room");
    navButton.addEventListener("click", (e)=>{
      this.router.navigateByUrl(`/join/${joinedRoom}`)
    })
  }
}
