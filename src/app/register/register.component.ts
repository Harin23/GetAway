import { Component, OnInit } from '@angular/core';
import { AuthService } from "../auth.service";
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  username = document.getElementById("username")
  regform = document.getElementById("regform")

  registerUserData:any = {}
  constructor(private _auth: AuthService) { }

  ngOnInit(): void {
  }

  registerUser() {
    this._auth.registerUser(this.registerUserData)
      .subscribe( 
        res => console.log(res),
        err => console.log(err)
      )
  }
}

//regform = document.getElementById("regForm").addEventListener("keypress", () => {});
//  regform.addEventListener("keypress", () => {})