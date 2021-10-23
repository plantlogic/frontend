import { ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import {NavbarComponent} from './navbar.component';
import { RouterTestingModule } from '@angular/router/testing';
import { FormBuilder } from '@angular/forms';
import { MDBBootstrapModule } from 'angular-bootstrap-md';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ NavbarComponent ],
      // imports: [ HttpClientModule, RouterTestingModule, MDBBootstrapModule.forRoot() ],
      // providers: [ FormBuilder ],
      // schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  }));

  // beforeEach(() => {
  //   fixture = TestBed.createComponent(NavbarComponent);
  //   component = fixture.componentInstance;
  //   fixture.detectChanges();
  // });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
});
