import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private _registerUrl = "http://localhost:3000/login/register"
  private _loginUrl = "http://localhost:3000/login"
  private _returnUsernameUrl = "http://localhost:3000/login/username"
  constructor(private http: HttpClient) { }


  registerUser(user: any){
    return this.http.post(this._registerUrl, user);
  }

  loginUser(user: any){
    return this.http.post(this._loginUrl, user, {responseType: 'json'});
  }

  loggedIn(){
    return !!localStorage.getItem('token');
  }

  getToken(){
    return localStorage.getItem('token');
  }
  
  fetchUsername(){
    return this.http.get(this._returnUsernameUrl)
  }


}
//