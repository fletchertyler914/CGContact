import { TestBed } from '@angular/core/testing';

import { ZingleService } from './zingle.service';

describe('ZingleService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ZingleService = TestBed.get(ZingleService);
    expect(service).toBeTruthy();
  });
});
