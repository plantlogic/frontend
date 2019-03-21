import { AuthService } from '../../../_auth/auth.service';
import { Component, OnInit } from '@angular/core';
import { TitleService } from '../../../_interact/title.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {AlertService} from '../../../_interact/alert.service';
import {Router} from '@angular/router';

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
        data => {
          if (data.success) {
            if (this.auth.isPasswordChangeRequired()) {
              AlertService.newMessage('Password changed successfully!', false);
              localStorage.removeItem('user_token');
              sessionStorage.removeItem('user_token');
              this.router.navigate(['/']);
            } else {
              AlertService.newMessage('Password changed successfully! You will be logged out in 5 seconds.', false);
              setTimeout(() => {
                this.auth.logout();
              }, 5000);
            }
          } else if (!data.success) {
            AlertService.newMessage('Change Failed: ' + data.error, true);
            this.form.enable();
          }
        },
        failure => {
          AlertService.newMessage('Change Failed: ' + failure.message, true);
          this.form.enable();
        }
      );
    }
  }

  public isRequired(): boolean {
    return this.auth.isPasswordChangeRequired();
  }
}
