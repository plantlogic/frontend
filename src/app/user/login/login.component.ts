import { AuthService } from '../../_auth/auth.service';
import { TitleService } from '../../_interact/title.service';
import { Component, OnInit } from '@angular/core';
import { AlertService } from '../../_interact/alert/alert.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  form: FormGroup;
  submitAttempted = false;

  constructor(private fb: FormBuilder, private titleService: TitleService, private auth: AuthService) {
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      rememberMe: ['']
    });
  }

  ngOnInit() {
    this.titleService.setTitle('Login');

    if (localStorage.hasOwnProperty('errorForLoginComponent')) {
      AlertService.newAlert(
        JSON.parse(
          localStorage.getItem('errorForLoginComponent')
        )
      );

      localStorage.removeItem('errorForLoginComponent');
    }

    if (localStorage.hasOwnProperty('rememberMeUsername')) {
      this.form.get('rememberMe').setValue(true);
      this.form.get('username').setValue(localStorage.getItem('rememberMeUsername'));
    }
  }

  public login() {
    if (this.form.get('username').invalid || this.form.get('password').invalid) {
      this.submitAttempted = true;
    } else {
      const val = this.form.value;
      if (val.rememberMe) {
        localStorage.setItem('rememberMeUsername', val.username);
      } else {
        localStorage.removeItem('rememberMeUsername');
      }

      this.auth.login(val.username, val.password, val.rememberMe);
    }
  }
}
