import { HttpInterceptorFn } from '@angular/common/http';
import {catchError, throwError} from 'rxjs';
import {inject} from '@angular/core';
import {Router} from '@angular/router';

export const ErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: any) => {
      if (error.status === 404) {
        router.navigate(['/not-found']);
      } else if (error.status >= 500) {
        router.navigate(['/error'], { queryParams: { code: error.status.toString() } });
      }
      else if (error.status === 0 || !error.status) {
        router.navigate(['/error'], { queryParams: { code: error.status.toString() } });
      }
      return throwError(() => error);
    })
  );
};
