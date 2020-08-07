import { Component, OnInit } from '@angular/core';
import { AuthService } from "../auth.service";
import { FormBuilder, Validators } from '@angular/forms';

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

  constructor(private _auth: AuthService, private _fb: FormBuilder) { }

  ngOnInit(): void {
  }

  registrationForm = this._fb.group({
    email: ['', Validators.required], 
    username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(15), Validators.pattern("[a-zA-Z0-9 ]*")]],
    password: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(15)]]
  });

  registerUser() {
    this._auth.registerUser(this.registrationForm.value)
      .subscribe( 
        res => console.log(res),
        err => console.log(err)
      )
  }
}