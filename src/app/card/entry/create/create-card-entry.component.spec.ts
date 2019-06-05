import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {CreateCardEntryComponent} from './create-card-entry.component';

describe('CreateCardEntryComponent', () => {
  let component: CreateCardEntryComponent;
  let fixture: ComponentFixture<CreateCardEntryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateCardEntryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateCardEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
