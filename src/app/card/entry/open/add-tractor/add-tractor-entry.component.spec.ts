import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTractorEntryComponent } from './add-tractor-entry.component';

describe('AddTractorEntryComponent', () => {
  let component: AddTractorEntryComponent;
  let fixture: ComponentFixture<AddTractorEntryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddTractorEntryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddTractorEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
