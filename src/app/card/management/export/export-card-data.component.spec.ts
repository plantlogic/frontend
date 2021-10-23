import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import { FormBuilder, FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { CommonFormDataService } from 'src/app/_api/common-form-data.service';

import {ExportCardDataComponent} from './export-card-data.component';

describe('ExportCardDataComponent', () => {
  let component: ExportCardDataComponent;
  let fixture: ComponentFixture<ExportCardDataComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ExportCardDataComponent ],
      // imports: [ HttpClientModule, RouterTestingModule, FormsModule, NgMultiSelectDropDownModule.forRoot() ],
      // providers: [ FormBuilder, CommonFormDataService ]
    })
    .compileComponents();
  }));

  // beforeEach(() => {
  //   fixture = TestBed.createComponent(ExportCardDataComponent);
  //   component = fixture.componentInstance;
  //   fixture.detectChanges();
  // });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
});
