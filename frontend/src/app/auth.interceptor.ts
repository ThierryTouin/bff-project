import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { catchError, Observable, throwError } from "rxjs";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}
 
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError(err => {
        console.log("AuthInterceptor caught error:", JSON.stringify(err));
        if (err.status === 401) {
          // Session expirée -> redirection vers la page login
          this.router.navigate(['/login']);
        }
        return throwError(() => err);
      })
    );
  }
}