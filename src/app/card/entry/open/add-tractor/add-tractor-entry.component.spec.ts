import { ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {HttpClientModule} from '@angular/common/http';
import {RouterTestingModule} from '@angular/router/testing';
import {AddTractorEntryComponent} from './add-tractor-entry.component';
import { FormBuilder, FormsModule } from '@angular/forms';

describe('AddTractorEntryComponent', () => {
  let component: AddTractorEntryComponent;
  let fixture: ComponentFixture<AddTractorEntryComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AddTractorEntryComponent ],
      // imports: [ HttpClientModule, RouterTestingModule, FormsModule ],
      // providers: [ FormBuilder ]
    })
    .compileComponents();
  }));

  // beforeEach(() => {
  //   fixture = TestBed.createComponent(AddTractorEntryComponent);
  //   component = fixture.componentInstance;
  //   fixture.detectChanges();
  // });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
});
