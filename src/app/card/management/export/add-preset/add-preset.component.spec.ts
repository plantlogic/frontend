import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPresetComponent } from './add-preset.component';

describe('AddPresetComponent', () => {
  let component: AddPresetComponent;
  let fixture: ComponentFixture<AddPresetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddPresetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddPresetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
