import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { FormBuilder } from '@angular/forms';
import {TestBed} from '@angular/core/testing';
import {CardExportService} from './card-export.service';

describe('CardExportService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [ HttpClientModule, RouterTestingModule ],
    providers: [ FormBuilder ]
  }));

  it('should be created', () => {
    const service: CardExportService = TestBed.get(CardExportService);
    expect(service).toBeTruthy();
  });
});
