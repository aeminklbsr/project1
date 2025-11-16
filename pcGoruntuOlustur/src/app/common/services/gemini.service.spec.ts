/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { GeminiService } from './gemini.service';

describe('Service: Gemini', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GeminiService]
    });
  });

  it('should ...', inject([GeminiService], (service: GeminiService) => {
    expect(service).toBeTruthy();
  }));
});
