import { TestBed } from '@angular/core/testing';

import { DcmaService } from './dcma.service';

describe('DcmaService', () => {
  let service: DcmaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DcmaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
