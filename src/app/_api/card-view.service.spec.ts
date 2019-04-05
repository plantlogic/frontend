import { TestBed } from '@angular/core/testing';

import { CardViewService } from './card-view.service';

describe('CardViewService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CardViewService = TestBed.get(CardViewService);
    expect(service).toBeTruthy();
  });
});
