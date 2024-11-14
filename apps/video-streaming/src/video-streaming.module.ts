import { Module } from '@nestjs/common';
import { VideoStreamingController } from './video-streaming.controller';
import { VideoStreamingService } from './video-streaming.service';

@Module({
  imports: [],
  controllers: [VideoStreamingController],
  providers: [VideoStreamingService],
})
export class VideoStreamingModule {}
