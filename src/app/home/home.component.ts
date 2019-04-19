import { Component, OnInit } from '@angular/core';
import { TitleService } from '../_interact/title.service';
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

  ngOnInit() {
    // Go straight to the create card page if only permission is data entry
    if (this.auth.permissionCount() === 1 && this.auth.hasPermission(PlRole.DATA_ENTRY)) {
      this.router.navigate(['/entry']);
    }

    this.titleService.setTitle('Home');
  }
}
