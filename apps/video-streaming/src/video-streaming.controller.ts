import { Controller, Get } from '@nestjs/common';
import { VideoStreamingService } from './video-streaming.service';

@Controller()
export class VideoStreamingController {
  constructor(private readonly videoStreamingService: VideoStreamingService) {}

  @Get()
  getHello(): string {
    return this.videoStreamingService.getHello();
  }
}
