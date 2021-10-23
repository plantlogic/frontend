import { ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import { EntryDashboardComponent } from './entry-dashboard.component';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { FormBuilder, FormsModule } from '@angular/forms';
import { MdbTableService } from 'angular-bootstrap-md';

describe('EntryDashboardComponent', () => {
  let component: EntryDashboardComponent;
  let fixture: ComponentFixture<EntryDashboardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EntryDashboardComponent ],
      imports: [ HttpClientModule, RouterTestingModule ]
      // providers: [ FormBuilder, MdbTableService ]
    })
    .compileComponents();
  }));

  // beforeEach(() => {
  //   fixture = TestBed.createComponent(EntryDashboardComponent);
  //   component = fixture.componentInstance;
  //   fixture.detectChanges();
  // });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
});
