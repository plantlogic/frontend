import { Component, OnInit } from '@angular/core';
import { TitleService } from '../_interact/title.service';
import { UserService } from './../_api/user.service';
import { AlertService } from '../_interact/alert.service';
import { User, fields as UserFields } from '../_auth/user';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {
  constructor(private titleService: TitleService, private userService: UserService) {}

  users: User[];
  fields = UserFields;

  ngOnInit() {
    this.titleService.setTitle('User Management');
    this.loadUserData();
  }

  private loadUserData() {
    this.userService.getUserList().subscribe(
      data => {
        if (data.success) {
          this.users = data.data;
        } else if (!data.success) {
          this.throwError(data.error);
        }
      },
      failure => {
        this.throwError(failure.message);
      }
    );
  }

  private throwError(error: string): void {
    AlertService.newMessage('Error: ' + error, true);
  }
}
