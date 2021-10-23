import { ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {AppAdminComponent} from './app-admin.component';
import {HttpClientModule} from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';

describe('AppAdminComponent', () => {
  let component: AppAdminComponent;
  let fixture: ComponentFixture<AppAdminComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AppAdminComponent ],
      imports: [ HttpClientModule,  RouterTestingModule]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
