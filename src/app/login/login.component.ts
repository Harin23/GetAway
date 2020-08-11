import { Component, OnInit } from '@angular/core';
import { AuthService } from "../auth.service";
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

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

  fetchedUsername = "";
  loginClicked = false;
  loginError = false;
  enableLogin = false;
  errorStatus0 = false;
  errorStatus401 = false;
  error401Message = "";
  
  constructor(private _auth: AuthService, 
    private _fb: FormBuilder,
    private _router: Router) { }

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
          this._router.navigate(['/host'])
        },
        err => {
          this.loginError = true;
          this.loginClicked = false;
          console.log(err);
          if (err.status === 0){
            this.errorStatus0 = true;
          }else if (err.status === 401){
            this.errorStatus401 = true;
            this.error401Message = err.error;
          }
        }
      )
  }
}
