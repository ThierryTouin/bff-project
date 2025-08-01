// frontend/src/app/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthService {
  constructor(private http: HttpClient) {}

  callDirectSecuHello(): Observable<string> {
    console.log("callDirectSecuHello()");
    //return this.http.get('/api/hello', { responseType: 'text' });
    return this.http.get('http://localhost:8081/api/secur/hello', { responseType: 'text' });
  }

  callDirectPublicHello(): Observable<string> {
    console.log("callDirectPublicHello()");
    return this.http.get('http://localhost:8081/api/public/hello', { responseType: 'text' });
  }


  callNginxSecuHello(): Observable<string> {
    console.log("callNginxSecuHello()");
    return this.http.get(
      'http://localhost:3001/api/secur/hello', 
      { 
        responseType: 'text', 
        withCredentials: true // for xsrf
      });
  }

  callNginxPublicHello(): Observable<string> {
    console.log("callNginxPublicHello()");
    return this.http.get(
      'http://localhost:3001/api/public/hello', 
      { 
        responseType: 'text', 
        withCredentials: true // for xsrf
      });
  }

  userInfo(): Observable<string> {
    console.log("callNginxPublicHello()");
    return this.http.get(
      'http://localhost:3001/api/secur/info', 
      { 
        responseType: 'text', 
        withCredentials: true // for xsrf
      });
  }

  // 🔽 Nouveau appel POST vers NGINX
  postToNginx(data: any): Observable<string> {
    console.log("postToNginx()", data);

    // Lire le cookie XSRF-TOKEN manuellement
    const xsrfToken = this.getCookie('XSRF-TOKEN');

    // Préparer les headers avec le token
    const headers = new HttpHeaders({
      'X-XSRF-TOKEN': xsrfToken || ''
    });


    return this.http.post(
      'http://localhost:3001/api/secur/post', 
      data, 
      { 
        headers: headers,
        responseType: 'text', 
        withCredentials: true // for xsrf // 🔥 essentiel pour que Angular envoie les cookies
      }
    );
  }

  private getCookie(name: string): string | null {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
  }

}