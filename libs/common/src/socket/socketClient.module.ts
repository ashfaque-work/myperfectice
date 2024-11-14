import { Module } from '@nestjs/common';
import { SocketClientService } from './socketClient.service';

@Module({
    imports: [],
    providers: [SocketClientService],
    exports: [SocketClientService],
})
export class SocketClientModule { }