import { HttpClientModule } from '@angular/common/http';
import {TestBed} from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

import {AuthInjector} from './auth.injector';

describe('AuthInjector', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [ HttpClientModule, RouterTestingModule ],
    providers: [ FormBuilder, AuthInjector ]
  }));

  it('should be created', () => {
    const service: AuthInjector = TestBed.get(AuthInjector);
    expect(service).toBeTruthy();
  });
});
