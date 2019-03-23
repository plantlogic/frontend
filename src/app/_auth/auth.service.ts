import { Router } from '@angular/router';
import { AlertService } from '../_interact/alert/alert.service';
import { BasicDTO } from '../_dto/basicDTO';
import { environment } from '../../environments/environment';
import {EventEmitter, Injectable} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthDTO } from '../_dto/auth/auth-dto';
import {Observable} from 'rxjs';
import {Alert} from '../_interact/alert/alert';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private static badTokenPing = 0;
  private static logoutSequenceInitiated = false;
  private MAXBADPING = 3;

  constructor(private http: HttpClient, private router: Router) { }

  private httpOptions = {headers: new HttpHeaders({'Content-Type': 'application/json'})};

  public login(username: string, password: string, rememberMe: boolean): void {
    if (!this.isLoggedIn()) {
      this.http.post<BasicDTO<AuthDTO>>('//' + environment.ApiUrl + '/user/auth/signIn', {username, password}, this.httpOptions)
        .subscribe(
          data => {
            if (data.success) {
              if (data.data.user.passwordReset) {
                sessionStorage.setItem('user_token', JSON.stringify(data.data));
                this.router.navigate(['/resetPassword']);
              } else {
                if (rememberMe) {
                  localStorage.setItem('user_token', JSON.stringify(data.data));
                } else {
                  sessionStorage.setItem('user_token', JSON.stringify(data.data));
                }
                this.router.navigate(['/loginRedirect']);
              }
            } else if (!data.success) {
              AlertService.newBasicAlert('Login Failed: ' + data.error, true);
            }
          },
          failure => {
            AlertService.newBasicAlert('Connection Error: ' + failure.message + ' (Try Again)', true);
          }
        );
    }
  }

  public logout() {
      localStorage.removeItem('user_token');
      sessionStorage.removeItem('user_token');
      this.router.navigate(['/loginRedirect']);
  }

  public renewToken(): void {
    this.http.get<BasicDTO<AuthDTO>>('//' + environment.ApiUrl + '/user/me/renewToken', this.httpOptions)
      .subscribe(
        data => {
          if (data.success) {
            if (localStorage.hasOwnProperty('user_token')) {
              localStorage.setItem('user_token', JSON.stringify(data.data));
            } else {
              sessionStorage.setItem('user_token', JSON.stringify(data.data));
            }
          } else if (!data.success) {
            const newAlert = new Alert();
            newAlert.title = 'Session Renewal Failed';
            newAlert.message = 'There was an error renewing your session: ' + data.error;
            newAlert.color = 'danger';
            newAlert.timeLeft = 30;
            newAlert.blockPageInteraction = true;
            newAlert.showClose = true;
            newAlert.closeName = 'Logout';
            newAlert.onClose$ = new EventEmitter<null>();
            AlertService.newAlert(newAlert);
            AuthService.logoutSequenceInitiated = true;

            newAlert.subscribedOnClose$ = newAlert.onClose$.subscribe(() => this.logout());
          }
        },
        failure => {
          const newAlert = new Alert();
          newAlert.title = 'Connection Error';
          newAlert.message = 'There was a connection error and we were unable to renew your session - please log out and log back in.';
          newAlert.color = 'danger';
          newAlert.timeLeft = 30;
          newAlert.blockPageInteraction = true;
          newAlert.showClose = true;
          newAlert.closeName = 'Logout';
          newAlert.onClose$ = new EventEmitter<null>();
          AlertService.newAlert(newAlert);
          AuthService.logoutSequenceInitiated = true;

          newAlert.subscribedOnClose$ = newAlert.onClose$.subscribe(() => this.logout());
        }
      );
  }


  public isLoggedIn(): boolean {
    if (environment.disableAuth) {
      return true;
    }

    let user: AuthDTO;
    if (localStorage.hasOwnProperty('user_token')) {
      user = JSON.parse(localStorage.getItem('user_token'));
    } else if (sessionStorage.hasOwnProperty('user_token')) {
      user = JSON.parse(sessionStorage.getItem('user_token'));
    }

    if (!user) {
      return false;
    } else if (Date.parse(user.expiration) <= Date.now()) {
      localStorage.removeItem('user_token');
      sessionStorage.removeItem('user_token');
      return false;
    } else if (user.user.passwordReset) {
      return false;
    } else {
      return true;
    }
  }

  public isPasswordChangeRequired(): boolean {
    if (environment.disableAuth) {
      return false;
    }

    let user: AuthDTO;
    if (localStorage.hasOwnProperty('user_token')) {
      user = JSON.parse(localStorage.getItem('user_token'));
    } else if (sessionStorage.hasOwnProperty('user_token')) {
      user = JSON.parse(sessionStorage.getItem('user_token'));
    }

    if (!user) {
      return false;
    } else if (Date.parse(user.expiration) <= Date.now()) {
      return false;
    } else if (user.user.passwordReset) {
      return true;
    } else {
      return false;
    }
  }

  public getName(): string {
    let user: AuthDTO;
    if (localStorage.hasOwnProperty('user_token')) {
      user = JSON.parse(localStorage.getItem('user_token'));
    } else if (sessionStorage.hasOwnProperty('user_token')) {
      user = JSON.parse(sessionStorage.getItem('user_token'));
    }

    if (user) {
      return user.user.realName;
    } else {
      return '<No_Name>';
    }
  }

  public getUsername(): string {
    let user: AuthDTO;
    if (localStorage.hasOwnProperty('user_token')) {
      user = JSON.parse(localStorage.getItem('user_token'));
    } else if (sessionStorage.hasOwnProperty('user_token')) {
      user = JSON.parse(sessionStorage.getItem('user_token'));
    }

    if (user) {
      return user.user.username;
    } else {
      return '<No_Username>';
    }
  }

  public getToken(): string {
    let user: AuthDTO;
    if (localStorage.hasOwnProperty('user_token')) {
      user = JSON.parse(localStorage.getItem('user_token'));
    } else if (sessionStorage.hasOwnProperty('user_token')) {
      user = JSON.parse(sessionStorage.getItem('user_token'));
    }

    if (user) {
      return user.token;
    } else {
      return '';
    }
  }

  public occasionalTokenValidate(): void {
    if (!AuthService.logoutSequenceInitiated) {
      if (this.isLoggedIn() || this.isPasswordChangeRequired()) {
        let user: AuthDTO;
        if (localStorage.hasOwnProperty('user_token')) {
          user = JSON.parse(localStorage.getItem('user_token'));
        } else if (sessionStorage.hasOwnProperty('user_token')) {
          user = JSON.parse(sessionStorage.getItem('user_token'));
        }

        if (Date.parse(user.expiration) <= Date.now() + (1000 * 60 * 3)) {
          const newAlert = new Alert();
          newAlert.title = 'Session Expiring';
          newAlert.message = 'Your session is about to expire - would you like to stay logged in?';
          newAlert.color = 'warning';
          newAlert.timeLeft = 90;
          newAlert.blockPageInteraction = true;
          newAlert.showClose = true;
          newAlert.closeName = 'Logout';
          newAlert.onClose$ = new EventEmitter<null>();
          newAlert.actionName = 'Continue';
          newAlert.actionClosesAlert = true;
          newAlert.actionClosesAlertWithoutOnClose = true;
          newAlert.action$ = new EventEmitter<null>();

          AlertService.newAlert(newAlert);
          AuthService.logoutSequenceInitiated = true;
          newAlert.subscribedAction$ = newAlert.action$.subscribe(() => {
            AuthService.logoutSequenceInitiated = false;
            localStorage.removeItem('errorForLoginComponent');
            this.renewToken();
          });
          newAlert.subscribedOnClose$ = newAlert.onClose$.subscribe(() => this.logout());


          const savedAlert = new Alert();
          savedAlert.title = 'Session Expired';
          savedAlert.message = 'Your session expired.';
          savedAlert.color = 'danger';
          savedAlert.timeLeft = undefined;
          savedAlert.blockPageInteraction = false;
          savedAlert.showClose = true;

          localStorage.setItem('errorForLoginComponent', JSON.stringify(savedAlert));
        } else {
          this.http.get<BasicDTO<null>>(
            '//' + environment.ApiUrl + '/user/me/tokenValid',
            {headers: new HttpHeaders({'Content-Type': 'application/json', ignoreLoadingBar: ''})}
          ).subscribe(
            data => {
              if (data.success) {
                AuthService.badTokenPing = 0;
              } else if (!data.success) {
                AuthService.badTokenPing++;
                if (AuthService.badTokenPing >= this.MAXBADPING) {
                  const newAlert = new Alert();
                  newAlert.title = 'Session Expired';
                  newAlert.message = 'Your session has expired - this may be due to a server restart or some other error.';
                  newAlert.color = 'danger';
                  newAlert.timeLeft = 30;
                  newAlert.blockPageInteraction = true;
                  newAlert.showClose = true;
                  newAlert.closeName = 'Logout';
                  newAlert.onClose$ = new EventEmitter<null>();
                  AlertService.newAlert(newAlert);
                  AuthService.logoutSequenceInitiated = true;

                  newAlert.subscribedOnClose$ = newAlert.onClose$.subscribe(() => this.logout());


                  const savedAlert = new Alert();
                  savedAlert.title = 'Session Expired';
                  savedAlert.message = 'Your session expired - this may have been due to a server restart or some other error.';
                  savedAlert.color = 'danger';
                  savedAlert.timeLeft = undefined;
                  savedAlert.blockPageInteraction = false;
                  savedAlert.showClose = true;

                  localStorage.setItem('errorForLoginComponent', JSON.stringify(savedAlert));
                }
              }
            },
            () => {
              AuthService.badTokenPing++;
              if (AuthService.badTokenPing >= this.MAXBADPING) {
                const newAlert = new Alert();
                newAlert.title = 'Server Not Responding';
                newAlert.message = 'The server has stopped responding - this may be due to a server restart or some other error.';
                newAlert.color = 'danger';
                newAlert.timeLeft = 30;
                newAlert.blockPageInteraction = true;
                newAlert.showClose = true;
                newAlert.closeName = 'Logout';
                newAlert.onClose$ = new EventEmitter<null>();
                AlertService.newAlert(newAlert);
                AuthService.logoutSequenceInitiated = true;

                newAlert.subscribedOnClose$ = newAlert.onClose$.subscribe(() => this.logout());


                const savedAlert = new Alert();
                savedAlert.title = 'Server Stopped Responding';
                savedAlert.message = 'The server stopped responding - this may have been due to a server restart or some other error.';
                savedAlert.color = 'danger';
                savedAlert.timeLeft = undefined;
                savedAlert.blockPageInteraction = false;
                savedAlert.showClose = true;

                localStorage.setItem('errorForLoginComponent', JSON.stringify(savedAlert));
              }
            }
          );
        }
      } else {
        const newAlert = new Alert();
        newAlert.title = 'Session Expired';
        newAlert.message = 'Your session has expired.';
        newAlert.color = 'danger';
        newAlert.timeLeft = 30;
        newAlert.blockPageInteraction = true;
        newAlert.showClose = true;
        newAlert.closeName = 'Logout';
        newAlert.onClose$ = new EventEmitter<null>();
        AlertService.newAlert(newAlert);
        AuthService.logoutSequenceInitiated = true;

        newAlert.subscribedOnClose$ = newAlert.onClose$.subscribe(() => this.logout());





        const savedAlert = new Alert();
        savedAlert.title = 'Session Expired';
        savedAlert.message = 'Your session expired.';
        savedAlert.color = 'danger';
        savedAlert.timeLeft = undefined;
        savedAlert.blockPageInteraction = false;
        savedAlert.showClose = true;

        localStorage.setItem('errorForLoginComponent', JSON.stringify(savedAlert));
      }
    }
  }

  public resetPassword(username: string): Observable<BasicDTO<any>> {
    return this.http.post<BasicDTO<null>>('//' + environment.ApiUrl + '/user/auth/resetPassword', {username}, this.httpOptions);
  }

  public changePassword(oldPassword: string, newPassword: string): Observable<BasicDTO<null>> {
    return this.http.post<BasicDTO<null>>(
        '//' + environment.ApiUrl + '/user/me/changePassword',
        {oldPassword, newPassword},
        this.httpOptions
    );
  }
}
