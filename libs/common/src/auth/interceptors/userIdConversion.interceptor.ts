import { Injectable, NestInterceptor, ExecutionContext, CallHandler, HttpException, HttpStatus } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class UserIdConversion implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const { body } = req;
    if (body.userId) {
        if (this.isValidEmail(body.userId)) {  
        req.body.email = body.userId;
        } else if (this.isValidPhoneNumber(body.userId)) {  
        req.body.phoneNumber = body.userId;
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