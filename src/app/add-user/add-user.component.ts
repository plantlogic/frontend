import { AlertService } from './../_interact/alert.service';
import { UserService } from './../_api/user.service';
import { Component, OnInit } from '@angular/core';
import { TitleService } from '../_interact/title.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { User } from '../_auth/user';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.scss']
})
export class AddUserComponent implements OnInit {
  form: FormGroup;
  submitAttempted = false;
  password: string;

  constructor(private titleService: TitleService, private fb: FormBuilder, private userService: UserService) {

    this.form = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(4)]],
      email: ['', [Validators.required, Validators.email]],
      realname: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.titleService.setTitle('Add User');
  }

  submit() {
    if (this.form.get('username').invalid ||
        this.form.get('email').invalid ||
        this.form.get('realname').invalid) {

          this.submitAttempted = true;

    } else {
      this.submitAttempted = false;
      const user = (new User()).infoConstruct(this.form.value.email, this.form.value.username, this.form.value.realname, []);
      this.userService.addUser(user).subscribe(
        data => {
          if (data.success) {
            this.password = data.data;
            AlertService.newMessage('User created successfully! Password below.', false);
            this.form.reset();
          } else if (!data.success) {
            AlertService.newMessage('Error: ' + data.error, true);
          }
        },
        failure => {
          AlertService.newMessage('Error: ' + failure.message, true);
        }
      );
    }
  }
}
