import {Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AlertService} from '../../_interact/alert.service';
import {AuthService} from '../../_auth/auth.service';
import { ModalDirective } from 'angular-bootstrap-md';
import {BasicDTO} from '../../_dto/basicDTO';
import {environment} from '../../../environments/environment';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
  form: FormGroup;
  error: string;
  isLoading = false;
  @ViewChild('fpModal') fpModal: ModalDirective;

  constructor(private fb: FormBuilder, private auth: AuthService) {
    this.form = this.fb.group({
      username: ['', Validators.required]
    });
  }

  ngOnInit() {
  }

  public submit() {
    this.error = null;
    if (this.form.get('username').invalid) {
      this.error = 'Please enter a username.';
    } else if (!this.auth.isLoggedIn() && !this.auth.isResetPassword()) {
      this.isLoading = true;
      this.form.get('username').disable();
      this.auth.resetPassword(this.form.get('username').value)
        .subscribe(
          data => {
            if (data.success) {
              this.fpModal.hide();
              AlertService.newMessage('Success! A temporary password has been emailed to you.', false);
              this.isLoading = false;
              this.form.get('username').enable();
              this.form.reset();
            } else if (!data.success) {
              this.error = 'Reset failed: ' + data.error;
              this.isLoading = false;
              this.form.get('username').enable();
            }
          },
          failure => {
            this.error = 'Reset failed: ' + failure.message;
            this.isLoading = false;
            this.form.get('username').enable();
          }
        );
    } else {
      this.error = 'You can\'t reset your password while logged in.';
    }
  }
}
