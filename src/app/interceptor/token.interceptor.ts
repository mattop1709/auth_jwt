import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { combineLatest, Observable, throwError } from 'rxjs';
import { AuthService } from 'src/app/service/auth.service';
import { catchError, switchMap, map } from 'rxjs/operators';
import { Token } from 'src/app/interface/token';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Storage } from '@ionic/storage';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  jwtHelper = new JwtHelperService();
  constructor(private authService: AuthService, private storage: Storage) {}
  intercept(
    request: HttpRequest<void>,
    next: HttpHandler
  ): Observable<HttpEvent<void>> {
    return combineLatest([
      this.authService.getAccessToken(),
      this.authService.getRefreshToken(),
    ]).pipe(
      map(([access_token, refresh_token]: string[]) => ({
        access_token,
        refresh_token,
      })),
      /** main interceptor */
      switchMap((token: Token) => {
        /** clone request */
        const transformedRequest = request.clone({
          headers: request.headers.set(
            'Authorization',
            `bearer ${token.access_token}`
          ),
        });
        /** clone request end */

        /** define next handler */
        return next.handle(transformedRequest).pipe(
          /** catch error if 401 */
          catchError(error => {
            if (
              error.status === 401 &&
              !error.message.includes('/auth/login')
            ) {
              return this.authService.refreshAllTokens(token).pipe(
                switchMap((newToken: Token) => {
                  console.log(`New Token ---> ${JSON.stringify(newToken)}`);
                  const { access_token } = newToken;
                  this.storeTokens(newToken);
                  this.decodeUser(access_token);

                  const transformedRequest = request.clone({
                    headers: request.headers.set(
                      'Authorization',
                      `bearer ${access_token}`
                    ),
                  });
                  return next.handle(transformedRequest);
                })
              );
            } else {
              console.log(
                `%c ERROR FROM INTERCEPTOR ${error.status}`,
                'color: #ff6c5c'
              );
            }
            return throwError(error);
          })
          /** end catch error if 401 */
        );
        /** next handler end */
      })
    );
    /** main intercept end */
  }

  storeTokens(token: Token): void {
    this.storage.set('access_token', token.access_token);
    this.storage.set('refresh_token', token.refresh_token);
  }

  decodeUser(access_token: string): void {
    const decodedUser = this.jwtHelper.decodeToken(access_token);
    console.log(decodedUser);
    this.authService.userInfo.next(decodedUser);
  }
}

/*
this.authService.getAccessToken(),
      this.authService.getRefreshToken(),
      (access_token, refresh_token) => {
        return { access_token, refresh_token };
      }
*/

/*
before include refresh token
 return from(this.authService.getAccessToken()).pipe(
      map((response: string) => response),
      switchMap((token: string) => {
        const transformedRequest = request.clone({
          headers: request.headers.set(`Authorization`, `bearer ${token}`),
        });
        return next.handle(transformedRequest);
      })
    );
*/
