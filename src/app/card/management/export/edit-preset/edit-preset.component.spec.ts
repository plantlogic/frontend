import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPresetComponent } from './edit-preset.component';

describe('EditPresetComponent', () => {
  let component: EditPresetComponent;
  let fixture: ComponentFixture<EditPresetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditPresetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditPresetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
