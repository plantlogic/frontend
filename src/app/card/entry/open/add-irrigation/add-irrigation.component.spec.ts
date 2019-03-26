import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddIrrigationComponent } from './add-irrigation.component';

describe('AddIrrigationComponent', () => {
  let component: AddIrrigationComponent;
  let fixture: ComponentFixture<AddIrrigationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddIrrigationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddIrrigationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
