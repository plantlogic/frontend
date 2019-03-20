import { AuthService } from './../_auth/auth.service';
import { AlertService } from './../_interact/alert.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TitleService } from '../_interact/title.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  form: FormGroup;
  submitAttempted = false;

  constructor(private titleService: TitleService, private fb: FormBuilder, private auth: AuthService) {
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
      this.auth.changePassword(val.oldPassword, val.newPassword);
    }
  }

  public isRequired(): boolean {
    return this.auth.isResetPassword();
  }
}
