import {Component, OnInit} from '@angular/core';
import {AuthService} from './_auth/auth.service';
import {interval} from 'rxjs';
import {environment} from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  pingIntervalInSeconds = 10;

  public constructor(private auth: AuthService) {}

  ngOnInit() {
    if ((this.auth.isLoggedIn() || this.auth.isPasswordChangeRequired()) && !environment.disableAuth) {
      interval(this.pingIntervalInSeconds * 1000)
        .subscribe(() => this.auth.occasionalTokenValidate());
    }
  }
}
