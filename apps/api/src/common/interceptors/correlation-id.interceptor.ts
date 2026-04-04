// apps/api/src/common/interceptors/correlation-id.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { Request, Response } from 'express';
import { requestContextStorage } from '../context/request-context';

@Injectable()
export class CorrelationIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();

    const correlationId =
      (req.headers['x-correlation-id'] as string | undefined) ?? uuidv4();

    res.setHeader('x-correlation-id', correlationId);

    // Run the rest of the request inside the AsyncLocalStorage context
    return new Observable((observer) => {
      const ctx = requestContextStorage.getStore();
      const newCtx = ctx
        ? { ...ctx, correlationId }
        : { userId: '', organizationId: null, role: '', isSuperAdmin: false, correlationId };

      requestContextStorage.run(newCtx, () => {
        next.handle().subscribe({
          next: (val) => observer.next(val),
          error: (err) => observer.error(err),
          complete: () => observer.complete(),
        });
      });
    });
  }
}
