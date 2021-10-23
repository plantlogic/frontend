import { HttpClientModule } from '@angular/common/http';
import {TestBed} from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

import {NavService} from './nav.service';

describe('NavService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [ HttpClientModule, RouterTestingModule ],
    providers: [ FormBuilder ]
  }));

  it('should be created', () => {
    const service: NavService = TestBed.get(NavService);
    expect(service).toBeTruthy();
  });
});
