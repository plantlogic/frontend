import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { MDBBootstrapModule } from 'angular-bootstrap-md';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';

import {LoginComponent} from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ LoginComponent, ForgotPasswordComponent ],
      // imports: [ HttpClientModule, RouterTestingModule, MDBBootstrapModule.forRoot() ],
      // providers: [ FormBuilder ]
    })
    .compileComponents();
  }));

  // beforeEach(() => {
  //   fixture = TestBed.createComponent(LoginComponent);
  //   component = fixture.componentInstance;
  //   fixture.detectChanges();
  // });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
});
