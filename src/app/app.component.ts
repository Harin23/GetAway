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

  constructor(private _auth: AuthService) {}

  fetchedUsername = "";

  fetchUsername() {
    this._auth.fetchUsername()
      .subscribe(
        res => {
          localStorage.setItem('username', res['username']);
          this.fetchedUsername = res['username'];
        },
        err => {
          console.log(err);
        }
      )
  }

}


