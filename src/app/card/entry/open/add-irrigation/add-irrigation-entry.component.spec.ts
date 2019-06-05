import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {AddIrrigationEntryComponent} from './add-irrigation-entry.component';

describe('AddIrrigationEntryComponent', () => {
  let component: AddIrrigationEntryComponent;
  let fixture: ComponentFixture<AddIrrigationEntryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddIrrigationEntryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddIrrigationEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
