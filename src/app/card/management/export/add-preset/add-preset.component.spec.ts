import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { AddPresetComponent } from './add-preset.component';
import { RouterTestingModule } from '@angular/router/testing';
import { FormBuilder, FormsModule } from '@angular/forms';

describe('AddPresetComponent', () => {
  let component: AddPresetComponent;
  let fixture: ComponentFixture<AddPresetComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AddPresetComponent ],
      // imports: [ HttpClientModule, RouterTestingModule, FormsModule ],
      // providers: [ FormBuilder ]
    })
    .compileComponents();
  }));

  // beforeEach(() => {
  //   fixture = TestBed.createComponent(AddPresetComponent);
  //   component = fixture.componentInstance;
  //   fixture.detectChanges();
  // });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
});
