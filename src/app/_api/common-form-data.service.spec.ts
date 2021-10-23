import { HttpClientModule } from '@angular/common/http';
import {TestBed} from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

import {CommonFormDataService} from './common-form-data.service';

describe('CommonFormDataService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [ HttpClientModule, RouterTestingModule ],
    providers: [ FormBuilder ]
  }));

  it('should be created', () => {
    const service: CommonFormDataService = TestBed.get(CommonFormDataService);
    expect(service).toBeTruthy();
  });
});
