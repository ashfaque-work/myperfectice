import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
    RequestTimeoutException,
} from '@nestjs/common';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            timeout(1000 * 60 * 10), // 10 minutes timeout
            catchError((err) =>
                err instanceof TimeoutError
                    ? throwError(() => new RequestTimeoutException())
                    : throwError(() => err),
            ),
        );
    }
}
