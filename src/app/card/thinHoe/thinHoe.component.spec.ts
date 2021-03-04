import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {CardThinHoeComponent} from './thinHoe.component';

describe('CardManagementComponent', () => {
  let component: CardThinHoeComponent;
  let fixture: ComponentFixture<CardThinHoeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CardThinHoeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CardThinHoeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
