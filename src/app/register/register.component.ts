import { Component, OnInit } from '@angular/core';
import { AuthService } from "../auth.service";
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AppComponent } from '../app.component';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  get email() {
    return this.registrationForm.get('email');
  };
  
  get username() {
    return this.registrationForm.get('username');
  };

  get password() {
    return this.registrationForm.get('password');
  };

  constructor(
    private _auth: AuthService, 
    private _fb: FormBuilder,
    private _router: Router,
    private _app: AppComponent) { }

  registerClicked = false;
  registerError = false;
  enableRegister = false;
  errorStatus0 = false;
  errorStatus400 = false;
  error400Message = "";

  ngOnInit(): void {
  }

  registrationForm = this._fb.group({
    email: ['', Validators.required], 
    username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(15), Validators.pattern("[a-zA-Z0-9 ]*")]],
    password: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(15)]]
  });

  registerUser() {
    this.registerClicked = true;
    localStorage.setItem('username', this.registrationForm.value.username)
    this._auth.registerUser(this.registrationForm.value)
      .subscribe( 
        res => {
          this.registerError = false;
          localStorage.setItem('token', res);
          this._app.displayUsername();
          this._router.navigate(['/host'])
        },
        err => {
          console.log(err);
          this.registerError = true;
          this.registerClicked = false;
          if (err.status === 0){
            this.errorStatus0 = true;
            this.errorStatus400 = false;
          }else if (err.status === 400){
            this.errorStatus400 = true;
            this.errorStatus0 = false;
            this.error400Message = err.error;
          }
        }
      )
  }
}