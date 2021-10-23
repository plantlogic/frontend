import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';

import {AddUserComponent} from './add-user.component';

describe('AddUserComponent', () => {
  let component: AddUserComponent;
  let fixture: ComponentFixture<AddUserComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AddUserComponent ],
      // imports: [ HttpClientModule, RouterTestingModule, FormsModule, ReactiveFormsModule, NgMultiSelectDropDownModule.forRoot() ],
      // providers: [ FormBuilder ]
    })
    .compileComponents();
  }));

  // beforeEach(() => {
  //   fixture = TestBed.createComponent(AddUserComponent);
  //   component = fixture.componentInstance;
  //   fixture.detectChanges();
  // });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
});
