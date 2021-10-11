import {AuthService} from './../_auth/auth.service';
import {Component} from '@angular/core';
import {TitleService} from '../_interact/title.service';
import {PlRole} from '../_dto/user/pl-role.enum';
import {Router} from '@angular/router';
import {NavService} from '../_interact/nav.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  // Allows for use in template
  role = PlRole;

  constructor(public titleService: TitleService, private auth: AuthService, private router: Router,
              private navService: NavService) {}

  hasRole(x: PlRole): boolean {
    return this.auth.hasPermission(x);
  }

  isLoggedIn(): boolean {
    return this.auth.isLoggedIn();
  }

  getName(): string {
    return this.auth.getName();
  }

  hasEmail(): boolean {
    return this.auth.hasEmail();
  }

  logout(): void {
    this.auth.logout();
  }

  goBack(): void {
    this.navService.goBack();
  }

  hasParent(): boolean {
    return this.navService.hasParent();
  }
}
