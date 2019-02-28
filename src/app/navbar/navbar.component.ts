import { AuthService } from './../_auth/auth.service';
import { Component, OnInit } from '@angular/core';
import { TitleService } from '../_interact/title.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  constructor(public titleService: TitleService, private auth: AuthService) {}

  ngOnInit() {
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
