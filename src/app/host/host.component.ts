import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-host',
  templateUrl: './host.component.html',
  styleUrls: ['./host.component.css']
})
export class HostComponent implements OnInit {

  constructor(private _auth: AuthService) { }

  ngOnInit(): void {
    this.fetchUsername()
  }

  fetchedUsername = "";
  fetchUsername() {
    if (this._auth.loggedIn) {
        this._auth.fetchUsername()
          .subscribe(
            res => {
              console.log(res)
              localStorage.setItem('username', res['collectedUsername']);
              this.fetchedUsername = res['collectedUsername'];
              console.log(this.fetchedUsername)
            },
            err => {
              console.log(err);
            }
          )
    }
  }

}
