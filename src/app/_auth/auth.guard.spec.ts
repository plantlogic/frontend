import {inject, TestBed} from '@angular/core/testing';

import {AllLoggedIn} from './auth.guard';

describe('AllLoggedIn', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AllLoggedIn]
    });
  });

  it('should ...', inject([AllLoggedIn], (guard: AllLoggedIn) => {
    expect(guard).toBeTruthy();
  }));
});
