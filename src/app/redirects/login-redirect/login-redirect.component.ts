import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-login-redirect',
  template: '<h1>Redirecting...</h1> <a href="/">If nothing happens, click here.</a>',
  styleUrls: []
})
export class LoginRedirectComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    window.location.replace('/');
  }

}
