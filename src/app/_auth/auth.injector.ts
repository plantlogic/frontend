import {AuthService} from './auth.service';
import {Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable()
export class AuthInjector implements HttpInterceptor {
  constructor(private auth: AuthService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
      if (this.auth.isLoggedIn() || this.auth.isPasswordChangeRequired()) {
        request = request.clone({
          setHeaders: {
              Authorization: `Bearer ${this.auth.getToken()}`
          }
        });
      }

      return next.handle(request);
  }
}
