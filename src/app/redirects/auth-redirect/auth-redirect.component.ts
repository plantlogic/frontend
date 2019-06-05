import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from '../../_auth/auth.service';

@Component({
  selector: 'app-auth-redirect',
  template: ''
})
export class AuthRedirectComponent implements OnInit {

  constructor(private router: Router, private auth: AuthService) { }

  ngOnInit() {
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['home']);
    } else {
      this.router.navigate(['login']);
    }
  }

}
