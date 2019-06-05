import {TestBed} from '@angular/core/testing';

import {CardExportService} from './card-export.service';

describe('CardExportService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CardExportService = TestBed.get(CardExportService);
    expect(service).toBeTruthy();
  });
});
