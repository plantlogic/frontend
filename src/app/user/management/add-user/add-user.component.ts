import {PlRole, PlRoleLookup} from '../../../_dto/user/pl-role.enum';
import {AlertService} from '../../../_interact/alert/alert.service';
import {UserService} from '../../../_api/user.service';
import {Component, OnInit} from '@angular/core';
import {TitleService} from '../../../_interact/title.service';
import {AbstractControl, FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {User} from '../../../_dto/user/user';
import {Router} from '@angular/router';
import {CommonFormDataService} from '../../../_api/common-form-data.service';
import { IDropdownSettings } from 'ng-multiselect-dropdown/multiselect.model';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.scss']
})
export class AddUserComponent implements OnInit {
  form: FormGroup;
  submitAttempted = false;
  manualPassword = false;
  hasBeenWarned = false;

  multiselectSettings: IDropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'value',
    selectAllText: 'Select All',
    unSelectAllText: 'Unselect All',
    itemsShowLimit: 5,
    allowSearchFilter: true
  };


  PlRoleLookup = PlRoleLookup;
  plRole = PlRole;
  roleList: Array<string>;
  roleListFormatted: Array<any>;
  userRolesFormatted: Array<any>;
  roleMultiSelectSettings: IDropdownSettings = {
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
      permissions: [],
      shipperID: ''
    });
  }

  ngOnInit() {
    this.titleService.setTitle('Add User');
    this.initRoles();
    this.roleListFormatted = this.getRoles();
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
    } else if (this.isShipper() && !this.form.value.shipperID) {
      this.submitAttempted = true;
      AlertService.newBasicAlert('Users with Shipper role need a shipper ID', true);
    } else {
      if (this.isShipper() && this.getSelectedRoles().includes(PlRole[PlRole.DATA_VIEW.toString()])) {
        AlertService.newBasicAlert('Error: \'Data View\' role supersedes Shipper role, please disable one and try again', true, 30);
        return;
      } else if (this.isShipper() && this.hasPerms() && !this.hasBeenWarned) {
        AlertService.newBasicAlert('Notice: Shipper role grants access to a limited view of the data page, ' +
              'adding additional view or edit roles may give the user unintended data access. Submit again to continue.', true, 30);
        this.hasBeenWarned = true;
        return;
      }
      this.submitAttempted = false;
      if (!this.isShipper()) {
        this.form.value.shipperID = null;
      }
      this.form.disable();

      let user: User;
      if (this.manualPassword) {
        user = (new User()).passConstruct(
          this.form.value.password,
          this.form.value.username,
          this.form.value.realname,
          this.getRanchAccess(),
          this.getSelectedRoles(),
          (this.form.value.shipperID) ? this.form.value.shipperID : ''
        );
      } else {
        user = (new User()).emailConstruct(
          this.form.value.email,
          this.form.value.username,
          this.form.value.realname,
          this.getRanchAccess(),
          this.getSelectedRoles(),
          (this.form.value.shipperID) ? this.form.value.shipperID : ''
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

  initRoles(): void {
    const keys = Object.keys(this.plRole);
    this.roleList = keys.slice(keys.length / 2).sort();
  }

  initRoleBoolArray(): Array<boolean> {
    return Array((Object.keys(this.plRole).length) / 2).fill(false);
  }

  isShipper(): boolean {
    return this.getSelectedRoles().includes(PlRole[PlRole.SHIPPER.toString()]);
  }

  getRanchAccess() {
    if (!this.hasPerms()) {return []; }
    try {
      return (this.form.value.ranchAccess) ? this.form.value.ranchAccess.map((e) => e.id) : [];
    } catch (e) {
      AlertService.newBasicAlert('Error When Reading Ranch Access', true);
      return [];
    }
  }

  getRoles() {
    return this.rolesToMultiSelectFormat(this.roleList);
  }

  getSelectedRoles() {
    return (this.userRolesFormatted) ? this.userRolesFormatted.map((role) => role.id) : [];
  }

  hasPerms(): boolean {
    const roles = this.getSelectedRoles();
    return roles.includes(PlRole[PlRole.DATA_ENTRY.toString()])
    || roles.includes(PlRole[PlRole.DATA_VIEW.toString()])
    || roles.includes(PlRole[PlRole.DATA_EDIT.toString()])
    || roles.includes(PlRole[PlRole.CONTRACTOR_VIEW.toString()])
    || roles.includes(PlRole[PlRole.CONTRACTOR_EDIT.toString()])
    || roles.includes(PlRole[PlRole.IRRIGATOR.toString()]);
  }

  rolesToMultiSelectFormat(roles) {
    try {
      const rolesFormatted = [];
      roles.forEach((role) => {
        rolesFormatted.push({
          id: role,
          value: (this.PlRoleLookup[role].display) ? this.PlRoleLookup[role].display : 'Display Value Not Found'
        });
      });
      return rolesFormatted;
    } catch (e) {
      return [];
    }
  }
}
