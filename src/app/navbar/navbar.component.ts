import { AuthService } from './../_auth/auth.service';
import { Component, OnInit } from '@angular/core';
import { TitleService } from '../_interact/title.service';
import { PlRole } from '../_dto/user/pl-role.enum';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  // Allows for use in template
  role = PlRole;

  constructor(public titleService: TitleService, private auth: AuthService) {}

  ngOnInit() {
  }

  hasRole(x: PlRole): boolean {
    return this.auth.hasPermission(x);
  }

  isLoggedIn(): boolean {
    return this.auth.isLoggedIn();
  }

  getName(): string {
    return this.auth.getName();
  }

  logout(): void {
    this.auth.logout();
  }
}
