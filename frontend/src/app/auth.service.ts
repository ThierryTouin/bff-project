// frontend/src/app/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthService {
  constructor(private http: HttpClient) {}

  callDirectSecuHello(): Observable<string> {
    //return this.http.get('/api/hello', { responseType: 'text' });
    return this.http.get('http://localhost:8081/api/secur/hello', { responseType: 'text' });
  }

  callDirectPublicHello(): Observable<string> {
    return this.http.get('http://localhost:8081/api/public/hello', { responseType: 'text' });
  }


  callNginxSecuHello(): Observable<string> {
    return this.http.get('http://localhost:3001/api/secur/hello', { responseType: 'text' });
  }

  callNginxPublicHello(): Observable<string> {
    return this.http.get('http://localhost:3001/api/public/hello', { responseType: 'text' });
  }


}