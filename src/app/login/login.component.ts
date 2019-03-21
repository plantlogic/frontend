import { AuthService } from './../_auth/auth.service';
import { TitleService } from '../_interact/title.service';
import { Component, OnInit } from '@angular/core';
import { AlertService } from '../_interact/alert.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  form: FormGroup;

  constructor(private fb: FormBuilder, private titleService: TitleService, private auth: AuthService,
              private router: Router) {
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      rememberMe: ['']
    });
  }

  ngOnInit() {
    this.titleService.setTitle('Login');
  }

  public login() {
    if (this.form.get('username').invalid && this.form.get('username').errors.required) {
      AlertService.newMessage('Username is required.', true);
    } else if (this.form.get('password').invalid && this.form.get('password').errors.required) {
      AlertService.newMessage('Password is required.', true);
    } else {
      const val = this.form.value;
      this.auth.login(val.username, val.password, val.rememberMe);
    }
  }
}
