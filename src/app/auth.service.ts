import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private registerUrl = "http://localhost:3000/login/register";
  private loginUrl = "http://localhost:3000/login";
  private verifyUrl = "http://localhost:3000/login/verify";
  private userInfoURL = "http://localhost:3000/login/userinfo";

  user = { username: "" };

  constructor(
    private http: HttpClient,
    private _router: Router
  ) { }

  registerUser(user: any){
    return this.http.post(this.registerUrl, user, {responseType: 'json'});
  }

  loginUser(user: any){
    return this.http.post(this.loginUrl, user, {responseType: 'json'});
  }

  userDataPresent(){
    return !! (localStorage.getItem('token') && localStorage.getItem('username'));
  }

  getToken(){
    return localStorage.getItem('token');
  } 
  
  logOut(){
    localStorage.clear();
    this._router.navigate(['/welcome'])
    return false;
  }

  verifyCredentials(){
    return this.http.post(this.verifyUrl, {responseType: 'json'});
  }

  getUserInfo(){
    return this.http.post(this.userInfoURL, {responseType: 'json'})
  }

}
