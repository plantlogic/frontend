import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import { FormBuilder, FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

import {OpenCardThinHoeComponent} from './open-card-thinHoe.component';

describe('OpenCardDataComponent', () => {
  let component: OpenCardThinHoeComponent;
  let fixture: ComponentFixture<OpenCardThinHoeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OpenCardThinHoeComponent ],
      // imports: [ HttpClientModule, RouterTestingModule, FormsModule ],
      // providers: [ FormBuilder ]
    })
    .compileComponents();
  }));

  // beforeEach(() => {
  //   fixture = TestBed.createComponent(OpenCardThinHoeComponent);
  //   component = fixture.componentInstance;
  //   fixture.detectChanges();
  // });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
});
