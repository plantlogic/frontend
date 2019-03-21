import { Component, OnInit } from '@angular/core';
import {AbstractControl, FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {PlRole} from '../../../_dto/user/pl-role.enum';
import {TitleService} from '../../../_interact/title.service';
import {UserService} from '../../../_api/user.service';
import {ActivatedRoute, Router} from '@angular/router';
import {User} from '../../../_dto/user/user';
import {AlertService} from '../../../_interact/alert.service';
import {AuthService} from '../../../_auth/auth.service';

@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.scss']
})
export class EditUserComponent implements OnInit {
  form: FormGroup;
  user: User;
  submitAttempted = false;
  plRole = PlRole;
  roleList: Array<string>;

  constructor(private titleService: TitleService, private fb: FormBuilder, private userService: UserService,
              private router: Router, private route: ActivatedRoute, private auth: AuthService) {

    this.form = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(4)]],
      email: ['', [Validators.required, Validators.email]],
      realname: ['', Validators.required],
      roles: this.fb.array(this.initRoleBoolArray())
    });

    this.form.disable();
    this.roleList = this.initRoles();
  }

  ngOnInit() {
    this.titleService.setTitle('Edit User');
    this.route.params.subscribe(
      data => {
        this.user = (new User()).editConstruct(data.username);
        this.userService.getUser(this.user.initialUsername).subscribe(
          apiData => {
            if (apiData.success) {
              this.user.importInfo(apiData.data);
              this.form.get('username').setValue(this.user.username);
              this.form.get('email').setValue(this.user.email);
              this.form.get('realname').setValue(this.user.realName);
              this.form.get('roles').setValue(this.setSelectedRoles());
              this.form.enable();
            } else if (!apiData.success) {
              AlertService.newMessage('Error: ' + apiData.error, true);
              this.router.navigate(['/userManagement']);
            }
          },
          failure => {
            AlertService.newMessage('Error: ' + failure.message, true);
            this.router.navigate(['/userManagement']);
          }
        );
      }
    );
  }

  submit() {
    if (this.form.get('username').invalid || this.form.get('email').invalid || this.form.get('realname').invalid) {
      this.submitAttempted = true;
    } else {
      this.submitAttempted = false;
      this.form.disable();

      this.user.username = this.form.value.username;
      this.user.email = this.form.value.email;
      this.user.realName = this.form.value.realname;
      this.user.permissions = this.getSelectedRoles();

      this.userService.editUser(this.user).subscribe(
        data => {
          if (data.success) {
            if (this.user.initialUsername === this.auth.getUsername()) {
              AlertService.newMessage('Changes have been saved successfully! ' +
                'Because you edited yourself, you will be logged out in 5 seconds.', false);
              setTimeout(() => {
                this.auth.logout();
              }, 5000);
            } else {
              AlertService.newMessage('Changes have been saved successfully!', false);
              this.router.navigate(['/userManagement']);
            }
          } else if (!data.success) {
            AlertService.newMessage('Error: ' + data.error, true);
            this.form.enable();
          }
        },
        failure => {
          AlertService.newMessage('Error: ' + failure.message, true);
          this.form.enable();
        }
      );
    }
  }

  resetPassword() {
    this.form.disable();
    this.userService.resetPassword(this.user.initialUsername).subscribe(
      data => {
        if (data.success) {
          if (this.user.initialUsername === this.auth.getUsername()) {
            AlertService.newMessage('Reset successful! A temporary password has been emailed to you. ' +
            'Because you edited yourself, you will be logged out in 5 seconds.', false);
            setTimeout(() => {
              this.auth.logout();
            }, 5000);
          } else {
            AlertService.newMessage('Reset successful! A temporary password has been emailed to the user.', false);
            this.router.navigate(['/userManagement']);
          }
        } else if (!data.success) {
          AlertService.newMessage('Error: ' + data.error, true);
          this.form.enable();
        }
      },
      failure => {
        AlertService.newMessage('Error: ' + failure.message, true);
        this.form.enable();
      }
    );
  }

  initRoles(): Array<string> {
    const keys = Object.keys(this.plRole);
    return keys.slice(keys.length / 2);
  }

  initRoleBoolArray(): Array<boolean> {
    return Array((Object.keys(this.plRole).length) / 2).fill(false);
  }

  getRoleFormControls(): AbstractControl[] {
    return (this.form.get('roles') as FormArray).controls;
  }

  setSelectedRoles(): Array<boolean> {
    return Object.keys(this.roleList)
      .map(key => this.user.permissions.includes(PlRole[key]));
  }

  getSelectedRoles(): Array<PlRole> {
    return Object.keys(this.plRole)
      .filter((d, ind) => this.form.get('roles').value[ind])
      .map(key => PlRole[key]);
  }
}
