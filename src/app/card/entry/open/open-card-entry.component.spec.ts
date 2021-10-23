import { ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {HttpClientModule} from '@angular/common/http';
import {OpenCardEntryComponent} from './open-card-entry.component';
import { RouterTestingModule } from '@angular/router/testing';
import { FormBuilder, FormsModule } from '@angular/forms';
import { CommonFormDataService } from 'src/app/_api/common-form-data.service';

describe('OpenCardEntryComponent', () => {
  let component: OpenCardEntryComponent;
  let fixture: ComponentFixture<OpenCardEntryComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OpenCardEntryComponent ],
      // imports: [ HttpClientModule, RouterTestingModule, FormsModule ],
      // providers: [ FormBuilder, CommonFormDataService ]
    })
    .compileComponents();
  }));

  // beforeEach(() => {
  //   fixture = TestBed.createComponent(OpenCardEntryComponent);
  //   component = fixture.componentInstance;
  //   fixture.detectChanges();
  // });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
});
