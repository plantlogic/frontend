import {Component, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AlertService} from '../../../_interact/alert/alert.service';
import {AuthService} from '../../../_auth/auth.service';
import {ModalDirective} from 'angular-bootstrap-md';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  form: FormGroup;
  error: string;
  isLoading = false;
  @ViewChild('fpModal', {static: false}) fpModal: ModalDirective;

  constructor(private fb: FormBuilder, private auth: AuthService) {
    this.form = this.fb.group({
      usernameFp: ['', Validators.required]
    });
  }

  public submit() {
    this.error = null;
    if (this.form.get('usernameFp').invalid) {
      this.error = 'Please enter a username.';
    } else if (!this.auth.isLoggedIn() && !this.auth.isPasswordChangeRequired()) {
      this.isLoading = true;
      this.form.get('usernameFp').disable();
      this.auth.resetPassword(this.form.get('usernameFp').value)
        .subscribe(
          (data) => {
            if (data.success) {
              this.fpModal.hide();
              AlertService.newBasicAlert('Success! If a user by that username exists, ' +
                'a temporary password has been emailed to the corresponding email address.', false, 30);
              this.isLoading = false;
              this.form.get('usernameFp').enable();
              this.form.reset();
            } else if (!data.success) {
              this.error = 'Reset failed: ' + data.error;
              this.isLoading = false;
              this.form.get('usernameFp').enable();
            }
          },
          (failure) => {
            this.error = 'Reset failed: ' + failure.message;
            this.isLoading = false;
            this.form.get('usernameFp').enable();
          }
        );
    } else {
      this.error = 'You can\'t reset your password while logged in.';
    }
  }
}
