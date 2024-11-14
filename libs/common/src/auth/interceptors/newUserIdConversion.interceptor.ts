import { Injectable, NestInterceptor, ExecutionContext, CallHandler, HttpException, HttpStatus } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class NewUserIdConversion implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const { body } = req;
    if (body.newUserId) {
        if (this.isValidEmail(body.newUserId)) {  
        req.body.email = body.newUserId;
        } else if (this.isValidPhoneNumber(body.newUserId)) {  
        req.body.phoneNumber = body.newUserId;
      }
    }

    return next.handle()
  }

  private isValidEmail(email: string): boolean {
    const emailRegex: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPhoneNumber(phoneNumber: string): boolean {
    const phoneRegex: RegExp = /^\d{10}$/;
      return phoneRegex.test(phoneNumber);
    }
}