import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageRanchComponent } from './manage-ranch.component';

describe('ManageRanchComponent', () => {
  let component: ManageRanchComponent;
  let fixture: ComponentFixture<ManageRanchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageRanchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageRanchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
