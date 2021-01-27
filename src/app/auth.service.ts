import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private _registerUrl = "http://localhost:3000/login/register";
  private _loginUrl = "http://localhost:3000/login";
  private returnUsernameUrl = "http://localhost:3000/login/username";
  private _verifyUrl = "http://localhost:3000/login/verify";
  private userInfoURL = "http://localhost:3000/login/userinfo";

  user = { username: "" };

  constructor(
    private http: HttpClient,
    private _router: Router
  ) { }

  registerUser(user: any){
    return this.http.post(this._registerUrl, user, {responseType: 'json'});
  }

  loginUser(user: any){
    return this.http.post(this._loginUrl, user, {responseType: 'json'});
  }

  userDataPresent(){
    return !! (localStorage.getItem('token') && localStorage.getItem('username'));
  }

  getToken(){
    return localStorage.getItem('token');
  } 

  fetchUsername(){
    return this.http.get(this.returnUsernameUrl)
  }
  
  logOut(){
    localStorage.clear();
    this._router.navigate(['/welcome'])
    return false;
  }

  verifyCredentials(){
    this.user.username = localStorage.getItem('username');
    return this.http.post(this._verifyUrl, this.user);
  }

  getUserInfo(){
    return this.http.post(this.userInfoURL, {responseType: 'json'})
  }

}
