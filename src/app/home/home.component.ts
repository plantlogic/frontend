import {Component, OnInit} from '@angular/core';
import {TitleService} from '../_interact/title.service';
import {AuthService} from '../_auth/auth.service';
import {PlRole} from '../_dto/user/pl-role.enum';
import {Router} from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  constructor(private titleService: TitleService, private auth: AuthService, private router: Router) { }

  message = '';

  ngOnInit() {
    /* ----------------
    Redirects
    ------------------- */

    if (this.auth.hasPermission(PlRole.DATA_ENTRY)) {
      // If on a mobile device, redirect to data entry
      if (window.matchMedia('only screen and (max-width: 760px)').matches) {
        this.router.navigate(['/entry']);
      }

      // Go straight to the create card page if only permission is data entry
      if (this.auth.permissionCount() === 1) {
        this.router.navigate(['/entry']);
      }
    }


    /* ----------------
    Page Init
    ------------------- */

    this.titleService.setTitle('Home');

    if (this.auth.permissionCount() === 0) {
      this.message = 'This account is disabled and has no permissions.';
    }
  }
}
