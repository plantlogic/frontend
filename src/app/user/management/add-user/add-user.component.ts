import { PlRole } from '../../../_dto/user/pl-role.enum';
import { AlertService } from '../../../_interact/alert.service';
import { UserService } from '../../../_api/user.service';
import { Component, OnInit } from '@angular/core';
import { TitleService } from '../../../_interact/title.service';
import { FormGroup, FormBuilder, FormArray, Validators, AbstractControl } from '@angular/forms';
import { User } from '../../../_dto/user/user';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.scss']
})
export class AddUserComponent implements OnInit {
  form: FormGroup;
  submitAttempted = false;
  plRole = PlRole;
  roleList: Array<string>;

  constructor(private titleService: TitleService, private fb: FormBuilder, private userService: UserService) {

    this.form = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(4)]],
      email: ['', [Validators.required, Validators.email]],
      realname: ['', Validators.required],
      roles: this.fb.array(this.initRoleBoolArray())
    });

    this.roleList = this.initRoles();
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
            AlertService.newMessage('User created successfully! Their temporary password was emailed to them.', false);
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

  getSelectedRoles(): Array<PlRole> {
    return Object.keys(this.plRole)
      .filter((d, ind) => this.form.get('roles').value[ind])
      .map(key => PlRole[key]);
  }
}
