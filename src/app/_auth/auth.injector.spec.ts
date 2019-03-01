import { TestBed } from '@angular/core/testing';

import { AuthInjector } from './auth.injector';

describe('AuthInjector', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AuthInjector = TestBed.get(AuthInjector);
    expect(service).toBeTruthy();
  });
});
