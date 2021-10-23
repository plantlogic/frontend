import { ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import {CardManagementComponent} from './card-management.component';
import { RouterTestingModule } from '@angular/router/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';

describe('CardManagementComponent', () => {
  let component: CardManagementComponent;
  let fixture: ComponentFixture<CardManagementComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CardManagementComponent ],
      // imports: [ HttpClientModule, RouterTestingModule, FormsModule, ReactiveFormsModule ],
      // providers: [ FormBuilder ]
    })
    .compileComponents();
  }));

  // beforeEach(() => {
  //   fixture = TestBed.createComponent(CardManagementComponent);
  //   component = fixture.componentInstance;
  //   fixture.detectChanges();
  // });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
});
