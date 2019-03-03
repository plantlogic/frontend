import { AuthService } from './../_auth/auth.service';
import { Component, OnInit } from '@angular/core';
import { TitleService } from '../_interact/title.service';
import { UserService } from './../_api/user.service';
import { AlertService } from '../_interact/alert.service';
import { User, fields as UserFields } from '../_dto/user/user';
import { MdbTableService } from 'angular-bootstrap-md';
import { throwError } from 'rxjs';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {
  constructor(private titleService: TitleService, private userService: UserService, private auth: AuthService,
              private tableService: MdbTableService) {}

  users: User[];
  fields = UserFields;
  filter: string;
  previous: string;

  ngOnInit() {
    this.titleService.setTitle('User Management');
    this.loadUserData();
  }

  private loadUserData() {
    this.userService.getUserList().subscribe(
      data => {
        if (data.success) {
          this.users = data.data;
          this.tableService.setDataSource(this.users);
          this.users = this.tableService.getDataSource();
          this.previous = this.tableService.getDataSource();
        } else if (!data.success) {
          this.throwError(data.error);
        }
      },
      failure => {
        this.throwError(failure.message);
      }
    );
  }

  public filterItems() {
    const prev = this.tableService.getDataSource();

    if (!this.filter) {
      this.tableService.setDataSource(this.previous);
      this.users = this.tableService.getDataSource();
    }

    if (this.filter) {
      this.users = this.tableService.searchLocalDataBy(this.filter);
      this.tableService.setDataSource(prev);
    }
  }

  public deleteUser(username: string) {
    if (username === this.auth.getUsername()) {
      this.throwError('You can\'t delete the user that is currently logged in.');
    } else if (confirm('Are you sure you want to delete user "' + username + '"?')) {
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
    }
  }

  private throwError(error: string): void {
    AlertService.newMessage('Error: ' + error, true);
  }
}
