import { Component, ViewEncapsulation } from '@angular/core';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent {
  title = 'GetAway';

  constructor(private _auth: AuthService,
  private _router: Router) {}

  ngOnInit(): void {
    this.UserAlreadySignedIn();
  }

  removeLoginRegister = false;
  usernameDisplay = "";

  UserAlreadySignedIn(){
    if (this._auth.userDataPresent()){
      this.displayUsername();
    }else{
      return false;
    }
  }

  displayUsername(){
    this.removeLoginRegister = true;
    this.usernameDisplay = localStorage.getItem('username');
  }

  logout(){
    this.removeLoginRegister = this._auth.logOut();
    this._router.navigate(['/welcome'])
  }
}

