import {AuthService} from '../../_auth/auth.service';
import {Component, EventEmitter, OnInit} from '@angular/core';
import {TitleService} from '../../_interact/title.service';
import {UserService} from '../../_api/user.service';
import {AlertService} from '../../_interact/alert/alert.service';
import {User} from '../../_dto/user/user';
import {MdbTableService} from 'angular-bootstrap-md';
import {Alert} from '../../_interact/alert/alert';
import {PlRoleLookup} from '../../_dto/user/pl-role.enum';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {
  constructor(private titleService: TitleService, private userService: UserService, private auth: AuthService,
              private tableService: MdbTableService) {}

  users: User[];
  filter: string;
  previous: string;
  PlRoleLookup = PlRoleLookup;

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
          AlertService.newBasicAlert('Error: ' + data.error, true);
        }
      },
      failure => {
        AlertService.newBasicAlert('Connection Error: ' + failure.message + ' (Try Again)', true);
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
      this.filter.toLowerCase();
      this.users = this.tableService.searchLocalDataBy(this.filter.toLowerCase());
      this.tableService.setDataSource(prev);
    }
  }

  public deleteUser(username: string) {
    if (username === this.auth.getUsername()) {
      AlertService.newBasicAlert('You can\'t delete the user that is currently logged in.', true);
    } else {
      const newAlert = new Alert();
      newAlert.title = 'Delete user?';
      newAlert.message = 'Are you sure you want to delete user ' + username + '?';
      newAlert.color = 'danger';
      newAlert.blockPageInteraction = true;
      newAlert.showClose = true;
      newAlert.closeName = 'Cancel';
      newAlert.actionName = 'Delete User';
      newAlert.action$ = new EventEmitter<null>();
      AlertService.newAlert(newAlert);

      newAlert.subscribedAction$ = newAlert.action$.subscribe(() => {
        this.userService.deleteUser((new User()).usernameConstruct(username)).subscribe(
          data => {
            if (data.success) {
              AlertService.newBasicAlert('User deleted successfully!', false);
            } else if (!data.success) {
              AlertService.newBasicAlert('Error: ' + data.error, true);
            }
            this.ngOnInit();
          },
          failure => {
            AlertService.newBasicAlert('Connection Error: ' + failure.message + ' (Try Again)', true);
          }
        );
      });
    }
  }

  // Used for animation
  public min(x: number, y: number): number {
    return Math.min(x, y);
  }
}
