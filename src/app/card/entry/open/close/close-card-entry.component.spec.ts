import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {CloseCardEntryComponent} from './close-card-entry.component';

describe('CloseCardEntryComponent', () => {
  let component: CloseCardEntryComponent;
  let fixture: ComponentFixture<CloseCardEntryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CloseCardEntryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CloseCardEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
