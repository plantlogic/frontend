import { AuthService } from './../_auth/auth.service';
import { Component, OnInit } from '@angular/core';
import { TitleService } from '../_interact/title.service';
import { UserService } from './../_api/user.service';
import { AlertService } from '../_interact/alert.service';
import { User, fields as UserFields } from '../_auth/user';
import { throwError } from 'rxjs';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {
  constructor(private titleService: TitleService, private userService: UserService, private auth: AuthService) {}

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

  public deleteUser(username: string) {
    if (username !== this.auth.getUsername()) {
      this.userService.deleteUser((new User()).usernameConstruct(username)).subscribe(
        data => {
          if (data.success) {
            AlertService.newMessage('User deleted successfully!', false);
          } else if (!data.success) {
            this.throwError(data.error);
          }
          this.ngOnInit();
        },
        failure => {
          this.throwError(failure.message);
        }
      );
    } else {
      this.throwError('You are attempting to delete the user that is currently logged in.');
    }
  }

  private throwError(error: string): void {
    AlertService.newMessage('Error: ' + error, true);
  }
}
