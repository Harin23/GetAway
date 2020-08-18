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

  loggedInBoolean = null;

  registerUser(user: any){
    return this.http.post(this._registerUrl, user, {responseType: 'text'});
  }

  loginUser(user: any){
    return this.http.post(this._loginUrl, user, {responseType: 'json'});
  }

  userDataPresent(){
    return !! (localStorage.getItem('token') && localStorage.getItem('username'));
  }

  loggedIn(){
      if (this.userDataPresent()){
        this.http.get(this._returnUsernameUrl)
          .subscribe(
            res =>{
              if (localStorage.getItem('username') === res['collectedUsername']){
                this.loggedInBoolean=true;
              }else{
                this.loggedInBoolean=false;
              }
            },
            err => {
              console.log(err);
              this.loggedInBoolean=false;
            }
          )
        return this.loggedInBoolean
      }else{
        return false;
      } 
  }

  getToken(){
    return localStorage.getItem('token');
  }
  
  fetchUsername(){
    return this.http.get(this._returnUsernameUrl)
  }

  logOut(){
    localStorage.clear();
    return false;
  }

}
//