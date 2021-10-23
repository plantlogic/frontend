import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CreateCardEntryComponent } from './create-card-entry.component';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonLookup } from 'src/app/_api/common-data.service';
import { CommonFormDataService } from 'src/app/_api/common-form-data.service';

describe('CreateCardEntryComponent', () => {
  let component: CreateCardEntryComponent;
  let fixture: ComponentFixture<CreateCardEntryComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateCardEntryComponent ],
      imports: [ HttpClientModule, RouterTestingModule, FormsModule, ReactiveFormsModule ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateCardEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
});
