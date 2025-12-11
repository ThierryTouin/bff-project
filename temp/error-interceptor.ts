import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {

        if (error.status === 401) {
          // Session expirée ou non authentifié
          this.router.navigate(['/login'], {
            queryParams: { redirect: this.router.url }
          });
        }

        else if (error.status === 403) {
          // Authentifié mais pas les permissions
          this.router.navigate(['/forbidden']);
        }

        else if (error.status === 404) {
          // Ressource introuvable
          this.router.navigate(['/not-found']);
        }

        // Tu peux aussi gérer le 500 ici si tu veux

        return throwError(() => error);
      })
    );
  }
}
