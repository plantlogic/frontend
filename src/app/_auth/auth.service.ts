import { Router } from '@angular/router';
import { AlertService } from '../_interact/alert.service';
import { BasicDTO } from '../_dto/basicDTO';
import { User } from './user';
import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { retry } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient, private router: Router) { }

  httpOptions = {headers: new HttpHeaders({'Content-Type': 'application/json'})};

  login(username: string, password: string, rememberMe: boolean) {
    return this.http.post<BasicDTO>('//' + environment.ApiUrl + '/user/auth/signin', {username, password}, this.httpOptions).subscribe(
      data => {
        if (data.success) {
          if (rememberMe) {
            sessionStorage.removeItem('user_token');
            localStorage.setItem('user_token', data.data);
          } else {
            localStorage.removeItem('user_token');
            sessionStorage.setItem('user_token', data.data);
          }
          this.router.navigate(['/']);
        } else if (!data.success) {
          AlertService.newMessage('Login failed: ' + data.error, true);
        }
      },
      failure => {
        AlertService.newMessage('Login failed: ' + failure.message, true);
      }
    );
  }

  logout() {
      localStorage.removeItem('user_token');
      sessionStorage.removeItem('user_token');
      this.router.navigate(['/']);
  }

  public isLoggedIn() {
    return (localStorage.getItem('user_token') !== null || sessionStorage.getItem('user_token') !== null) || environment.disableAuth;
  }

  isLoggedOut() {
      return !this.isLoggedIn();
  }
}
