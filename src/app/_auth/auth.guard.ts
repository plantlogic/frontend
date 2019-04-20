import {Injectable} from '@angular/core';
import {Location} from '@angular/common';
import {ActivatedRoute, ActivatedRouteSnapshot, CanActivate, Router} from '@angular/router';
import {AuthService} from './auth.service';
import {PlRole} from '../_dto/user/pl-role.enum';

@Injectable({
  providedIn: 'root'
})
export class AllLoggedIn implements CanActivate {
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
export class NotAuthenticated implements CanActivate {
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
export class RequiredPasswordChange implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate() {
    if (this.auth.isPasswordChangeRequired() || (this.auth.isLoggedIn() && this.auth.hasEmail())) {
      return true;
    } else {
      this.router.navigate(['/']);
      return false;
    }
  }
}

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot) {
    if (this.auth.isLoggedIn() && route.data.role.map(r => this.auth.hasPermission(r)).includes(true)) {
      return true;
    } else {
      this.router.navigate(['/']);
      return false;
    }
  }
}
