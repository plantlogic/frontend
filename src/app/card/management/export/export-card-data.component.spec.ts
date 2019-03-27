import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportCardDataComponent } from './export-card-data.component';

describe('ExportCardDataComponent', () => {
  let component: ExportCardDataComponent;
  let fixture: ComponentFixture<ExportCardDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExportCardDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExportCardDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
