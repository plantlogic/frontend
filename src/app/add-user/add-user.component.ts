import { PlRole } from './../_dto/user/pl-role.enum';
import { AlertService } from './../_interact/alert.service';
import { UserService } from './../_api/user.service';
import { Component, OnInit } from '@angular/core';
import { TitleService } from '../_interact/title.service';
import { FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import { User } from '../_dto/user/user';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.scss']
})
export class AddUserComponent implements OnInit {
  form: FormGroup;
  submitAttempted = false;
  password: string;
  plRole = PlRole;
  roleList: Array<string>;

  constructor(private titleService: TitleService, private fb: FormBuilder, private userService: UserService) {

    this.form = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(4)]],
      email: ['', [Validators.required, Validators.email]],
      realname: ['', Validators.required],
      roles: this.fb.array(this.getRoleBoolArray())
    });

    this.roleList = this.getRoles();
  }

  ngOnInit() {
    this.titleService.setTitle('Add User');
  }

  submit() {
    if (this.form.get('username').invalid ||
        this.form.get('email').invalid ||
        this.form.get('realname').invalid) {

          this.submitAttempted = true;

    } else {
      this.submitAttempted = false;

      const user = (
        new User()).infoConstruct(this.form.value.email, this.form.value.username, this.form.value.realname, this.getSelectedRoles()
      );

      this.userService.addUser(user).subscribe(
        data => {
          if (data.success) {
            this.password = data.data;
            AlertService.newMessage('User created successfully! Password below.', false);
            this.form.reset();
          } else if (!data.success) {
            AlertService.newMessage('Error: ' + data.error, true);
          }
        },
        failure => {
          AlertService.newMessage('Error: ' + failure.message, true);
        }
      );
    }
  }

  getRoles(): Array<string> {
    const keys = Object.keys(this.plRole);
    return keys.slice(keys.length / 2);
  }

  getRoleBoolArray(): Array<boolean> {
    const out: Array<boolean> = [];
    for (let i = 0; i < (Object.keys(this.plRole).length) / 2; i++) {
      out.push(false);
    }
    return out;
  }

  getSelectedRoles(): Array<PlRole> {
    /* const perms: Array<PlRole> = [];
    for (let i = 0; i < this.roleList.length; i++) {
      if ((this.form.get('roles').value)[i]) {
        perms.push(PlRole[this.roleList[i]]);
      }
    }
    return perms; */
    return Object.keys(this.plRole).filter((d, ind) => this.form.get('roles').value[ind]).map(key => PlRole[key]);
  }
}
