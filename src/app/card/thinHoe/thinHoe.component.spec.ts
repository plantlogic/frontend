import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import { FormBuilder, FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { CommonFormDataService } from 'src/app/_api/common-form-data.service';

import {CardThinHoeComponent} from './thinHoe.component';

describe('CardManagementComponent', () => {
  let component: CardThinHoeComponent;
  let fixture: ComponentFixture<CardThinHoeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CardThinHoeComponent ],
      // imports: [ HttpClientModule, RouterTestingModule, FormsModule ],
      // providers: [ FormBuilder, CommonFormDataService ]
    })
    .compileComponents();
  }));

  // beforeEach(() => {
  //   fixture = TestBed.createComponent(CardThinHoeComponent);
  //   component = fixture.componentInstance;
  //   fixture.detectChanges();
  // });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
});
