import { TitleService } from './../title.service';
import { Component, OnInit } from '@angular/core';
import { AlertService } from '../alert.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  constructor(private titleService: TitleService) { }

  ngOnInit() {
    this.titleService.setTitle('Login');
  }

  public exampleSuccess() {
    AlertService.newMessage('Hello! This is an example of a "success" message. It may wrap because it is intentionally a bit long.', false);
  }

}
