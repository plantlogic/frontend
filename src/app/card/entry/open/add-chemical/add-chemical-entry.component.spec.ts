import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {AddChemicalEntryComponent} from './add-chemical-entry.component';

describe('AddChemicalComponent', () => {
  let component: AddChemicalEntryComponent;
  let fixture: ComponentFixture<AddChemicalEntryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddChemicalEntryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddChemicalEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
