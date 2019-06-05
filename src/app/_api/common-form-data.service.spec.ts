import {TestBed} from '@angular/core/testing';

import {CommonFormDataService} from './common-form-data.service';

describe('CommonFormDataService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CommonFormDataService = TestBed.get(CommonFormDataService);
    expect(service).toBeTruthy();
  });
});
