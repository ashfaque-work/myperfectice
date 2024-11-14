import { Injectable } from '@nestjs/common';

@Injectable()
export class VideoStreamingService {
  getHello(): string {
    return 'Hello World!';
  }
}
