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
  @ViewChild('fpModal') fpModal: ModalDirective;

  constructor(private fb: FormBuilder, private auth: AuthService) {
    this.form = this.fb.group({
      username: ['', Validators.required]
    });
  }

  ngOnInit() {
  }

  public submit() {
    if (this.form.get('username').invalid) {
      this.error = 'Please enter a username.';
    } else if (!this.auth.isLoggedIn() && !this.auth.isResetPassword()) {
      this.auth.resetPassword(this.form.get('username').value)
        .subscribe(
          data => {
            if (data.success) {
              this.fpModal.hide();
              AlertService.newMessage('Success! A temporary password has been emailed to you.', false);
            } else if (!data.success) {
              this.error = 'Reset Failed: ' + data.error;
            }
          },
          failure => {
            this.error = 'Reset Failed: ' + failure.message;
          }
        );
    } else {
      this.error = 'You can\'t reset your password while logged in.';
    }
  }
}
