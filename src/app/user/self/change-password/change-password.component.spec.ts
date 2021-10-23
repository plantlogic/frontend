import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {FormBuilder} from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import {ChangePasswordComponent} from './change-password.component';

describe('ChangePasswordComponent', () => {
  let component: ChangePasswordComponent;
  let fixture: ComponentFixture<ChangePasswordComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ChangePasswordComponent ],
      // imports: [ HttpClientModule, RouterTestingModule ],
      // providers: [ FormBuilder ]
    })
    .compileComponents();
  }));

  // beforeEach(() => {
  //   fixture = TestBed.createComponent(ChangePasswordComponent);
  //   component = fixture.componentInstance;
  //   fixture.detectChanges();
  // });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
});
