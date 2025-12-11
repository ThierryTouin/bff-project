import { HttpInterceptorFn, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { tap, catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {

  const router = inject(Router);

  return next(req).pipe(

    // Gestion erreurs fonctionnelles (réponse 200)
    tap(event => {
      if (event instanceof HttpResponse) {
        const body = event.body;

        if (body?.error === true && body?.code) {
          handleFunctionalError(body.code, body.message, router);
        }
      }
    }),

    // Gestion erreurs HTTP
    catchError((error: HttpErrorResponse) => {

      const functionalHeader = error.headers.get('X-App-Error');
      if (functionalHeader) {
        handleFunctionalError(functionalHeader, error.error, router);
      }

      switch (error.status) {
        case 401:
          router.navigate(['/login'], { queryParams: { redirect: router.url } });
          break;

        case 403:
          router.navigate(['/forbidden']);
          break;

        case 404:
          router.navigate(['/not-found']);
          break;

        case 500:
          router.navigate(['/server-error']);
          break;
      }

      return throwError(() => error);
    })
  );
};


function handleFunctionalError(code: string, message: string, router: Router) {

  console.warn('Functional error:', code, message);

  switch (code) {

    case 'USER_BLOCKED':
      router.navigate(['/account-blocked']);
      break;

    case 'OUT_OF_STOCK':
      router.navigate(['/product-unavailable']);
      break;

    default:
      router.navigate(['/functional-error'], { queryParams: { code } });
      break;
  }
}
