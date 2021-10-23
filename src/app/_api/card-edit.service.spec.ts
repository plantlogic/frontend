import { HttpClientModule } from '@angular/common/http';
import {TestBed} from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

import {CardEditService} from './card-edit.service';

describe('CardEditService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [ HttpClientModule, RouterTestingModule ],
    providers: [ FormBuilder ]
  }));

  it('should be created', () => {
    const service: CardEditService = TestBed.get(CardEditService);
    expect(service).toBeTruthy();
  });
});
