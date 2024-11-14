import { Test, TestingModule } from '@nestjs/testing';
import { VideoStreamingController } from './video-streaming.controller';
import { VideoStreamingService } from './video-streaming.service';

describe('VideoStreamingController', () => {
  let videoStreamingController: VideoStreamingController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [VideoStreamingController],
      providers: [VideoStreamingService],
    }).compile();

    videoStreamingController = app.get<VideoStreamingController>(VideoStreamingController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(videoStreamingController.getHello()).toBe('Hello World!');
    });
  });
});
