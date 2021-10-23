import { ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { FormBuilder, FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { CommonFormDataService } from 'src/app/_api/common-form-data.service';

import {OpenCardDataComponent} from './open-card-data.component';
import { TitleService } from 'src/app/_interact/title.service';
import { CardViewService } from 'src/app/_api/card-view.service';
import { CardEditService } from 'src/app/_api/card-edit.service';
import { NavService } from 'src/app/_interact/nav.service';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/_auth/auth.service';

describe('OpenCardDataComponent', () => {
  let component: OpenCardDataComponent;
  let fixture: ComponentFixture<OpenCardDataComponent>;

  // Necessary Services for testing? titleService

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OpenCardDataComponent ],
      // imports: [ HttpClientModule, RouterTestingModule, FormsModule, NgMultiSelectDropDownModule.forRoot() ],
      // providers: [ FormBuilder, CommonFormDataService ]
      // schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  }));

  // beforeEach(() => {
  //   fixture = TestBed.createComponent(OpenCardDataComponent);
  //   component = fixture.componentInstance;
  //   fixture.detectChanges();
  // });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
});
