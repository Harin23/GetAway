import { Injectable, Injector } from '@angular/core';
import { HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from './auth.service';

@Injectable()
export class TokenInterceptorService implements HttpInterceptor {

  constructor(private _injector: Injector) { }

  intercept(req, next){
    let _authServ = this._injector.get(AuthService)
    let reqWithAuthHeader = req.clone({
      setHeaders: {
        Authorization: `Bearer ${_authServ.getToken()}`
      }
    });
    return next.handle(reqWithAuthHeader);
  };

}
