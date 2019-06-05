import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {OpenCardEntryComponent} from './open-card-entry.component';

describe('OpenCardEntryComponent', () => {
  let component: OpenCardEntryComponent;
  let fixture: ComponentFixture<OpenCardEntryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OpenCardEntryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OpenCardEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
