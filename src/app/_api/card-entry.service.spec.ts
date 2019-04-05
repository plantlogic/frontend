import { TestBed } from '@angular/core/testing';

import { CardEntryService } from './card-entry.service';

describe('CardEntryService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CardEntryService = TestBed.get(CardEntryService);
    expect(service).toBeTruthy();
  });
});
