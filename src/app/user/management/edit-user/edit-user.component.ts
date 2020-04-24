import {Component, EventEmitter, OnInit} from '@angular/core';
import {AbstractControl, FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {PlRole, PlRoleLookup} from '../../../_dto/user/pl-role.enum';
import {TitleService} from '../../../_interact/title.service';
import {UserService} from '../../../_api/user.service';
import {ActivatedRoute, Router} from '@angular/router';
import {User} from '../../../_dto/user/user';
import {AlertService} from '../../../_interact/alert/alert.service';
import {AuthService} from '../../../_auth/auth.service';
import {Alert} from '../../../_interact/alert/alert';
import {CommonFormDataService} from '../../../_api/common-form-data.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.scss']
})
export class EditUserComponent implements OnInit {
  form: FormGroup;
  PlRoleLookup = PlRoleLookup;
  user: User = new User();
  submitAttempted = false;
  plRole = PlRole;
  roleList: Array<string>;
  manualPassword = false;
  hadEmail: boolean;
  ranchDropDownSettings = {};
  ranchList = [];
  userRanches = [];
  multiSelectSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'value',
    selectAllText: 'Select All',
    unSelectAllText: 'Unselect All',
    itemsShowLimit: 5,
    allowSearchFilter: true
  };
  hasBeenWarned = false;

  constructor(private titleService: TitleService, private fb: FormBuilder, private userService: UserService,
              private router: Router, private route: ActivatedRoute, private auth: AuthService,
              public commonData: CommonFormDataService) {

    this.form = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(4)]],
      password: [''],
      email: ['', [Validators.required, Validators.email]],
      realName: ['', [Validators.required]],
      ranchAccess: [],
      roles: this.fb.array(this.initRoleBoolArray()),
      shipperID: ''
    });
    this.form.disable();
    this.roleList = this.initRoles();
  }

  ngOnInit() {
    const tempThis = this;
    this.titleService.setTitle('Edit User');
    this.route.params.subscribe(
      data => {
        this.user = (new User()).editConstruct(data.username);
        this.userService.getUser(this.user.initialUsername, true).subscribe(
          apiData => {
            if (apiData.success) {
              this.user.importInfo(apiData.data);
              this.form.get('username').setValue(this.user.username);
              this.form.get('email').setValue(this.user.email);
              this.form.get('realName').setValue(this.user.realName);
              this.form.get('roles').setValue(this.setSelectedRoles());
              this.form.get('shipperID').setValue(this.user.shipperID);
              this.commonData.getValues('ranches', ranches => {
                tempThis.userRanches = ranches.filter(e => {
                  tempThis.ranchList.push(e);
                  return tempThis.user.ranchAccess.includes(e.id);
                });
                tempThis.form.get('ranchAccess').setValue(tempThis.userRanches);
              });
              if (!this.user.email) {
                this.manualPassword = true;
                this.hadEmail = false;
              } else {
                this.hadEmail = true;
              }

              this.form.enable();
            } else if (!apiData.success) {
              AlertService.newBasicAlert('Error: ' + apiData.error, true);
              this.router.navigate(['/userManagement']);
            }
          },
          failure => {
            AlertService.newBasicAlert('Connection Error: ' + failure.message + ' (Try Again)', true);
            this.router.navigate(['/userManagement']);
          }
        );
      }
    );
  }

  isShipper(): boolean {
    return this.getSelectedRoles().includes(PlRole[PlRole.SHIPPER.toString()]);
  }

  getRanchAccess() {
    if (!this.hasPerms()) {return []; }
    try {
      return (this.form.value.ranchAccess) ? this.form.value.ranchAccess.map(e => e.id) : [];
    } catch (e) {
      AlertService.newBasicAlert('Error When Reading Ranch Access', true);
      return [];
    }
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
    if (this.form.get('username').invalid || this.form.get('realName').invalid  || this.passwordOrEmailInvalid()) {
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
      this.user.username = this.form.value.username;
      this.user.email = this.form.value.email;
      this.user.password = this.form.value.password;
      this.user.realName = this.form.value.realName;
      this.user.ranchAccess = this.getRanchAccess();
      this.user.permissions = this.getSelectedRoles();
      this.user.shipperID = (this.isShipper() && this.form.value.shipperID) ? this.form.value.shipperID : null;
      this.userService.editUser(this.user).subscribe(
        data => {
          if (data.success) {
            if (this.user.initialUsername === this.auth.getUsername()) {
              this.editSelfAlert('Changes have been saved successfully!');
            } else {
              if (!this.manualPassword && !this.hadEmail) {
                AlertService.newBasicAlert('Changes have been saved successfully! Because you added an email address, the user\'s ' +
                  'password has been reset and emailed to them.', false, 30);
              } else {
                AlertService.newBasicAlert('Changes have been saved successfully!', false);
              }
              this.router.navigate(['/userManagement']);
            }
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

  resetPassword() {
    this.form.disable();
    this.userService.resetPassword(this.user.initialUsername).subscribe(
      data => {
        if (data.success) {
          if (this.user.initialUsername === this.auth.getUsername()) {
            this.editSelfAlert('Reset successful! A temporary password has been emailed to you.');
          } else {
            AlertService.newBasicAlert('Reset successful! A temporary password has been emailed to the user.', false);
            this.router.navigate(['/userManagement']);
          }
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

  hasPerms(): boolean {
    const roles = this.getSelectedRoles();
    return roles.includes(PlRole[PlRole.DATA_ENTRY.toString()])
    || roles.includes(PlRole[PlRole.DATA_VIEW.toString()])
    || roles.includes(PlRole[PlRole.DATA_EDIT.toString()])
    || roles.includes(PlRole[PlRole.CONTRACTOR_VIEW.toString()])
    || roles.includes(PlRole[PlRole.CONTRACTOR_EDIT.toString()]);
  }

  editSelfAlert(prefixMessage: string): void {
    const newAlert = new Alert();

    newAlert.title = 'Success';
    newAlert.showClose = true;
    newAlert.closeName = 'Logout';
    newAlert.timeLeft = 10;
    newAlert.message = prefixMessage + ' Because you edited yourself, you must log out and log back in to continue.';
    newAlert.color = 'success';
    newAlert.blockPageInteraction = true;
    newAlert.onClose$ = new EventEmitter<null>();
    newAlert.subscribedOnClose$ = newAlert.onClose$.subscribe(() => {
      this.auth.logout();
    });

    AlertService.newAlert(newAlert);
  }
}
