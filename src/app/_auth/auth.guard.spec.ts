import { HttpClientModule } from '@angular/common/http';
import {inject, TestBed} from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

import {AllLoggedIn} from './auth.guard';

describe('AllLoggedIn', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AllLoggedIn, FormBuilder],
      imports: [HttpClientModule, RouterTestingModule]
    });
  });

  it('should ...', inject([AllLoggedIn], (guard: AllLoggedIn) => {
    expect(guard).toBeTruthy();
  }));
});
