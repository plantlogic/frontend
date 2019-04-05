import { TestBed } from '@angular/core/testing';

import { CardEditService } from './card-edit.service';

describe('CardEditService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CardEditService = TestBed.get(CardEditService);
    expect(service).toBeTruthy();
  });
});
