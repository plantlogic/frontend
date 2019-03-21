import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate() {
    if (this.auth.isLoggedIn()) {
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
}

@Injectable({
  providedIn: 'root'
})
export class NotAuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}
  canActivate() {
    if (this.auth.isPasswordChangeRequired()) {
      this.router.navigate(['/changePassword']);
      return false;
    } else if (!this.auth.isLoggedIn()) {
      return true;
    } else {
      this.router.navigate(['/home']);
      return false;
    }
  }
}

@Injectable({
  providedIn: 'root'
})
export class ChangePasswordGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}
  canActivate() {
    if (this.auth.isPasswordChangeRequired() || this.auth.isLoggedIn()) {
      return true;
    } else {
      this.router.navigate(['/']);
      return false;
    }
  }
}
