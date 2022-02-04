import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AttachmentService } from './attachment.service';

describe('AttachmentService', () => {
  let service: AttachmentService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AttachmentService],
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(AttachmentService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    expect(1).toBe(1);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should upload', () => {
    service.upload({} as File).subscribe();
    http.expectOne({ method: 'POST', url: '/api/user/attachments' });
  });
});
