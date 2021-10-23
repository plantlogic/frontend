import { HttpClientModule } from '@angular/common/http';
import {TestBed} from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

import {CardEntryService} from './card-entry.service';

describe('CardEntryService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [ HttpClientModule, RouterTestingModule ],
    providers: [ FormBuilder ]
  }));

  it('should be created', () => {
    const service: CardEntryService = TestBed.get(CardEntryService);
    expect(service).toBeTruthy();
  });
});
