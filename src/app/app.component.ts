import {Component, OnInit} from '@angular/core';
import {AuthService} from './_auth/auth.service';
import {interval, timer} from 'rxjs';
import {retry, startWith, switchMap} from 'rxjs/operators';
import {AlertService} from './_interact/alert/alert.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  MAXBADPING = 3;
  badTokenPing = 0;
  pingIntervalInSeconds = 10;

  public constructor(private auth: AuthService) {}

  ngOnInit() {
    if (this.auth.isLoggedIn() || this.auth.isPasswordChangeRequired()) {
      interval(this.pingIntervalInSeconds * 1000)
        .subscribe(() => this.auth.validateToken().subscribe(
          data => {
            if (data.success) {
              this.badTokenPing = 0;
            } else if (!data.success) {
              this.badTokenPing++;
              if (this.badTokenPing >= this.MAXBADPING) {
                AlertService.newBasicAlert('Your session has expired.', true);
                setTimeout(() => {
                  this.auth.logout();
                }, 5000);
              }
            }
          },
          () => {
            this.badTokenPing++;
            if (this.badTokenPing >= this.MAXBADPING) {
              AlertService.newBasicAlert('The server is no longer responding.', true);
              setTimeout(() => {
                this.auth.logout();
              }, 5000);
            }
          }
        ));
    }
  }
}
