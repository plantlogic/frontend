import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTractorComponent } from './add-tractor.component';

describe('AddTractorComponent', () => {
  let component: AddTractorComponent;
  let fixture: ComponentFixture<AddTractorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddTractorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddTractorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
