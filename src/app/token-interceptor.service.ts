import { Injectable, Injector } from '@angular/core';
import { HttpInterceptor } from '@angular/common/http';
import { AuthService } from './auth.service';

@Injectable()
export class TokenInterceptorService implements HttpInterceptor {

  constructor(private injector: Injector) { }

  intercept(req, next){
    let authServ = this.injector.get(AuthService)
    let reqWithAuthHeader = req.clone({
      setHeaders: {
        Authorization: `Bearer ${authServ.getToken()}`
      }
    });
    return next.handle(reqWithAuthHeader);
  };

}
