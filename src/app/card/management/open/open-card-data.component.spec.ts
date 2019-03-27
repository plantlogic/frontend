import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenCardDataComponent } from './open-card-data.component';

describe('OpenCardDataComponent', () => {
  let component: OpenCardDataComponent;
  let fixture: ComponentFixture<OpenCardDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OpenCardDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OpenCardDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
