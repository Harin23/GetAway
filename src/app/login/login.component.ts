import { Component, OnInit } from '@angular/core';
import { AuthService } from "../auth.service";
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AppComponent } from '../app.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  get userid() {
    return this.loginForm.get('userid')
  }

  get password() {
    return this.loginForm.get('password')
  }

  loginClicked = false;
  loginError = false;
  enableLogin = false;
  errorStatus0 = false;
  errorStatus401 = false;
  error401Message = "";
  
  constructor(private _auth: AuthService, 
    private _fb: FormBuilder,
    private _router: Router,
    private _app: AppComponent) { }

  ngOnInit(): void {
  }

  loginForm = this._fb.group({
    userid: ['', Validators.required],
    password: ['', Validators.required]
  })

  loginUser() {
    this.loginClicked = true;
    this.loginError = false;
    this._auth.loginUser(this.loginForm.value)
      .subscribe( 
        res => {
          localStorage.setItem('token', res['token']);
          this.fetchUsername();
          
        },
        err => {
          this.loginError = true;
          this.loginClicked = false;
          console.log(err);
          if (err.status === 0){
            this.errorStatus0 = true;
            this.errorStatus401 = false;
          }else if (err.status === 401){
            this.errorStatus401 = true;
            this.errorStatus0 = false;
            this.error401Message = err.error;
          }
        }
      )
  }

  fetchUsername() {
    if (this._auth.loggedIn) {
        this._auth.fetchUsername()
          .subscribe(
            res => {
              localStorage.setItem('username', res['collectedUsername']);
              this._app.displayUsername();
              this._router.navigate(['/host'])
            },
            err => {
              console.log(err);
            }
          )
    }
  }

}
