import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {OpenCardThinHoeComponent} from './open-card-thinHoe.component';

describe('OpenCardDataComponent', () => {
  let component: OpenCardThinHoeComponent;
  let fixture: ComponentFixture<OpenCardThinHoeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OpenCardThinHoeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OpenCardThinHoeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
