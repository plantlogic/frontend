import {AuthService} from '../../../_auth/auth.service';
import {Component, EventEmitter, OnInit} from '@angular/core';
import {TitleService} from '../../../_interact/title.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AlertService} from '../../../_interact/alert/alert.service';
import {Router} from '@angular/router';
import {Alert} from '../../../_interact/alert/alert';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {
  form: FormGroup;
  submitAttempted = false;

  constructor(private titleService: TitleService, private fb: FormBuilder, private auth: AuthService,
              private router: Router) {
    this.form = this.fb.group({
      oldPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(4)]],
      verifyNewPassword: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.titleService.setTitle('Change Password');
  }

  public newPasswordVerified(): boolean {
    return (this.form.get('newPassword').value === this.form.get('verifyNewPassword').value);
  }

  public submit(): void {
    if (this.form.get('oldPassword').invalid || this.form.get('newPassword').invalid
        || this.form.get('verifyNewPassword').invalid || !this.newPasswordVerified()) {
      this.submitAttempted = true;
    } else {
      const val = this.form.value;
      this.form.disable();
      this.auth.changePassword(val.oldPassword, val.newPassword).subscribe(
        (data) => {
          if (data.success) {
            const newAlert = new Alert();
            newAlert.title = 'Success';
            newAlert.message = 'Password changed successfully! You must logout and log back in to complete the change.';
            newAlert.color = 'success';
            newAlert.timeLeft = 30;
            newAlert.blockPageInteraction = true;
            newAlert.showClose = true;
            newAlert.closeName = 'Logout';
            newAlert.onClose$ = new EventEmitter<null>();
            AlertService.newAlert(newAlert);

            newAlert.subscribedOnClose$ = newAlert.onClose$.subscribe(() => this.auth.logout());
          } else if (!data.success) {
            AlertService.newBasicAlert('Change Failed: ' + data.error, true);
            this.form.enable();
          }
        },
        (failure) => {
          AlertService.newBasicAlert('Connection Error: ' + failure.message + ' (Try Again)', true);
          this.form.enable();
        }
      );
    }
  }

  public isRequired(): boolean {
    return this.auth.isPasswordChangeRequired();
  }
}
