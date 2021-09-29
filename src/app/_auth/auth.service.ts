import {Router} from '@angular/router';
import {AlertService} from '../_interact/alert/alert.service';
import {BasicDTO} from '../_dto/basicDTO';
import {environment} from '../../environments/environment';
import {EventEmitter, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import decode from 'jwt-decode';
import {Alert} from '../_interact/alert/alert';
import {PlRole} from '../_dto/user/pl-role.enum';
import {User} from '../_dto/user/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private static badTokenPing = 0;
  private static logoutSequenceInitiated = false;
  private static tokenCache: string;
  private static userCache: User;
  private static expCache: number;
  private MAXBADPING = 3;
  private roleList = Object.keys(PlRole);

  constructor(private http: HttpClient, private router: Router) { }

  private httpOptions = {headers: new HttpHeaders({'Content-Type': 'application/json'})};



  // =============================
  // Actions
  // =============================

  public login(username: string, password: string, rememberMe: boolean): void {
    if (!this.isLoggedIn()) {
      this.http.post<BasicDTO<string>>(environment.ApiUrl + '/user/auth/signIn', {username, password}, this.httpOptions)
        .subscribe(
          (data) => {
            if (data.success) {

              this.resetCache();
              if (rememberMe) {
                localStorage.setItem('user_token', data.data);
              } else {
                sessionStorage.setItem('user_token', data.data);
              }

              this.router.navigate(['/loginRedirect']);
            } else if (!data.success) {
              // console.log(data);
              AlertService.newBasicAlert('Login Failed: ' + data.error, true);
            }
          },
          (failure) => {
            AlertService.newBasicAlert('Connection Error: ' + failure.message + ' (Try Again)', true);
          }
        );
    }
  }

  public logout() {
      this.clearTokenStore();
      this.router.navigate(['/loginRedirect']);
  }

  public renewToken(): void {
    this.http.get<BasicDTO<string>>(environment.ApiUrl + '/user/me/renewToken', this.httpOptions)
      .subscribe(
        (data) => {
          if (data.success) {
            this.resetCache();
            if (localStorage.hasOwnProperty('user_token')) {
              localStorage.setItem('user_token', data.data);
            } else {
              sessionStorage.setItem('user_token', data.data);
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
        (failure) => {
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

  public resetPassword(username: string): Observable<BasicDTO<any>> {
    return this.http.post<BasicDTO<null>>(environment.ApiUrl + '/user/auth/resetPassword', {username}, this.httpOptions);
  }

  public changePassword(oldPassword: string, newPassword: string): Observable<BasicDTO<null>> {
    return this.http.post<BasicDTO<null>>(
      environment.ApiUrl + '/user/me/changePassword',
      {oldPassword, newPassword},
      this.httpOptions
    );
  }

  public occasionalTokenValidate(): void {
    if (!AuthService.logoutSequenceInitiated) {
      if (this.isLoggedIn() || this.isPasswordChangeRequired()) {
        if (this.getParsedTokenExpiration() <= Date.now() + (1000 * 60 * 3)) {
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
            environment.ApiUrl + '/user/me/tokenValid',
            {headers: new HttpHeaders({'Content-Type': 'application/json', ignoreLoadingBar: ''})}
          ).subscribe(
            (data) => {
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



  // =============================
  // User States
  // =============================


  public isLoggedIn(): boolean {
    if (environment.disableAuth) {
      return true;
    }

    const user: User = this.getParsedTokenUser();
    const exp: number = this.getParsedTokenExpiration();

    if (!user && !exp) {
      return false;
    } else if (!user || !exp) {
      this.clearTokenStore();
      return false;
    } else if (exp <= Date.now()) {
      this.clearTokenStore();
      this.occasionalTokenValidate();
      return false;
    } else if (user.passwordReset) {
      return false;
    } else {
      return true;
    }
  }

  public isPasswordChangeRequired(): boolean {
    if (environment.disableAuth) {
      return false;
    }

    const user: User = this.getParsedTokenUser();
    const exp: number = this.getParsedTokenExpiration();

    if (!user && !exp) {
      return false;
    } else if (!user || !exp) {
      this.clearTokenStore();
      return false;
    } else if (exp <= Date.now()) {
      this.clearTokenStore();
      this.occasionalTokenValidate();
      return false;
    } else if (user.passwordReset) {
      return true;
    } else {
      return false;
    }
  }



  // =============================
  // User Info Getters
  // =============================

  public getName(): string {
    const user: User = this.getParsedTokenUser();

    if (user) {
      return user.realName;
    } else {
      return '<No_Name>';
    }
  }

  public getUsername(): string {
    const user: User = this.getParsedTokenUser();

    if (user) {
      return user.username;
    } else {
      return '<No_Username>';
    }
  }

  public getRanchAccess(): Array<string> {
    const user: User = this.getParsedTokenUser();

    if (user && user.ranchAccess) {
      return user.ranchAccess;
    } else {
      return [];
    }
  }

  public getShipperID(): string {
    const user: User = this.getParsedTokenUser();
    if (user && this.hasPermission(PlRole.SHIPPER) && user.shipperID) {
      return user.shipperID;
    } else {
      return null;
    }
  }

  public hasEmail(): boolean {
    const user: User = this.getParsedTokenUser();

    if (user && user.email) {
      return true;
    } else {
      return false;
    }
  }

  public hasPermission(perm: PlRole): boolean {
    const user: User = this.getParsedTokenUser();
    if (environment.disableAuth) {
      return true;
    } else if (user) {
      return user.permissions.includes(PlRole[this.roleList[perm]]);
    } else {
      return false;
    }
  }

  public permissionCount(): number {
    const user: User = this.getParsedTokenUser();

    if (user) {
      return user.permissions.length;
    } else {
      return -1;
    }
  }


  // =============================
  // Token Management
  // =============================

  public getToken(): string {
    if (!AuthService.tokenCache) {
      if (localStorage.hasOwnProperty('user_token')) {
        AuthService.tokenCache = localStorage.getItem('user_token');
      } else if (sessionStorage.hasOwnProperty('user_token')) {
        AuthService.tokenCache = sessionStorage.getItem('user_token');
      }
    }

    return AuthService.tokenCache;
  }

  public getParsedTokenExpiration(): number {
    if (!AuthService.expCache) {
      const token = this.getToken();
      if (token) {
        try {
          AuthService.expCache = decode(token)["exp"] * 1000;
        } catch (error) {
          // Continue
        }
      }
    }
    return AuthService.expCache;
  }

  public getParsedTokenUser(): User {
    if (!AuthService.userCache) {
      const token = this.getToken();
      if (token) {
        try {
          AuthService.userCache = decode(token)["auth"];
        } catch (error) {}
      }
    }

    return AuthService.userCache;
  }

  public resetCache(): void {
    AuthService.tokenCache = undefined;
    AuthService.userCache = undefined;
    AuthService.expCache = undefined;
  }

  public clearTokenStore(): void {
    localStorage.removeItem('user_token');
    sessionStorage.removeItem('user_token');
    this.resetCache();
  }
}
