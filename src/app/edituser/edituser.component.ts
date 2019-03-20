import { UserManagementComponent } from '../user/management/user-management.component';
import { AuthService } from './../_auth/auth.service';
import { Component, OnInit } from '@angular/core';
import { TitleService } from '../_interact/title.service';
import { UserService } from './../_api/user.service';
import { User, fields as UserFields } from '../_dto/user/user';
import { MdbTableService } from 'angular-bootstrap-md';
import { throwError } from 'rxjs';
// import { userInfo } from 'os';


@Component({
  selector: 'app-edituser',
  templateUrl: './edituser.component.html',
  styleUrls: ['./edituser.component.scss']
})


export class EdituserComponent implements OnInit {
  constructor(private titleService: TitleService, private userService: UserService, private auth: AuthService,
    private tableService: MdbTableService) {}

    users: User;
    userName: string;
    realName: string;
    email: string;




  ngOnInit() {
    this.titleService.setTitle('Edit User');
    this.userName = this.auth.getUsername();
    this.loadUser();


  }

  private loadUser() {
    const x  = (new User).usernameConstruct(this.userName);

    this.userService.getUser(x).subscribe(
      data => {
        if(data.success) {
              this.userName = data.data.username;
              this.realName = data.data.realName;
              this.email = data.data.email;
        }
      }
    )
  }

}
