import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class AttachmentService {

  constructor(private http: HttpClient) { }

  upload(file: File): Observable<HttpEvent<any>> {
    const data = new FormData();
    data.append('file', file);

    const req = new HttpRequest('POST', '/api/user/attachments', data,
      { reportProgress: true, responseType: 'json' });

    return this.http.request(req);
  }
}
