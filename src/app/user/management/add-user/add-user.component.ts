import {PlRole, PlRoleLookup} from '../../../_dto/user/pl-role.enum';
import {AlertService} from '../../../_interact/alert/alert.service';
import {UserService} from '../../../_api/user.service';
import {Component, OnInit} from '@angular/core';
import {TitleService} from '../../../_interact/title.service';
import {AbstractControl, FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {User} from '../../../_dto/user/user';
import {Router} from '@angular/router';
import {CommonFormDataService} from '../../../_api/common-form-data.service';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.scss']
})
export class AddUserComponent implements OnInit {
  form: FormGroup;
  PlRoleLookup = PlRoleLookup;
  submitAttempted = false;
  plRole = PlRole;
  roleList: Array<string>;
  manualPassword = false;

  multiselectSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'value',
    selectAllText: 'Select All',
    unSelectAllText: 'Unselect All',
    itemsShowLimit: 5,
    allowSearchFilter: true
  };

  constructor(private titleService: TitleService, private fb: FormBuilder, private userService: UserService,
              private router: Router, public commonData: CommonFormDataService) {

    this.form = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(4)]],
      password: ['', [Validators.required, Validators.minLength(4)]],
      email: ['', [Validators.required, Validators.email]],
      realname: ['', [Validators.required]],
      ranchAccess: [],
      roles: this.fb.array(this.initRoleBoolArray())
    });

    this.roleList = this.initRoles();
  }

  ngOnInit() {
    this.titleService.setTitle('Add User');
  }

  passwordOrEmailInvalid(): boolean {
    if (this.manualPassword) {
      this.form.get('email').setValue('');
      return this.form.get('password').invalid;
    } else {
      this.form.get('password').setValue('');
      return this.form.get('email').invalid;
    }
  }

  submit() {
    if (this.form.get('username').invalid || this.form.get('realname').invalid || this.passwordOrEmailInvalid()) {
      this.submitAttempted = true;
    } else {
      this.submitAttempted = false;
      this.form.disable();

      let user: User;
      if (this.manualPassword) {
        user = (new User()).passConstruct(
          this.form.value.password,
          this.form.value.username,
          this.form.value.realname,
          this.form.value.ranchAccess.map(e => e.id),
          this.getSelectedRoles()
        );
      } else {
        user = (new User()).emailConstruct(
          this.form.value.email,
          this.form.value.username,
          this.form.value.realname,
          this.form.value.ranchAccess.map(e => e.id),
          this.getSelectedRoles()
        );
      }
      this.userService.addUser(user).subscribe(
        data => {
          if (data.success) {
            if (!this.manualPassword) {
              AlertService.newBasicAlert('User created successfully! Their temporary password was emailed to them.', false);
            } else {
              AlertService.newBasicAlert('User created successfully!', false);
            }
            this.router.navigate(['/userManagement']);
          } else if (!data.success) {
            AlertService.newBasicAlert('Error: ' + data.error, true);
            this.form.enable();
          }
        },
        failure => {
          AlertService.newBasicAlert('Connection Error: ' + failure.message + ' (Try Again)', true);
          this.form.enable();
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

  hasPerms(): boolean {
    const roles = this.getSelectedRoles();
    return roles.includes(PlRole[PlRole.DATA_ENTRY.toString()])
    || roles.includes(PlRole[PlRole.DATA_VIEW.toString()])
    || roles.includes(PlRole[PlRole.DATA_EDIT.toString()])
    || roles.includes(PlRole[PlRole.CONTRACTOR_VIEW.toString()])
    || roles.includes(PlRole[PlRole.CONTRACTOR_EDIT.toString()]);
  }
}
