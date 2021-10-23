import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MDBBootstrapModule, ModalDirective, ModalModule, ModalOptions } from 'angular-bootstrap-md';
import { AlertComponent } from './alert.component';
import { AlertService } from './alert.service';

describe('AlertComponent', () => {
  let component: AlertComponent;
  let fixture: ComponentFixture<AlertComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AlertComponent, ModalDirective ],
      imports: [ MDBBootstrapModule.forRoot(), ModalModule.forRoot() ],
      providers: [ AlertService ]
    })
    .compileComponents();
  }));

  // beforeEach(() => {
  //   fixture = TestBed.createComponent(AlertComponent);
  //   component = fixture.componentInstance;
  //   fixture.detectChanges();
  // });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
});
