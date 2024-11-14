import { Injectable } from '@nestjs/common';
import { BitlyClient } from 'bitly';

@Injectable()
export class BitlyService {
  private readonly bitly: BitlyClient;

  constructor() {
    this.bitly = new BitlyClient('9b179167215492a469c8e6c9c83ce513dc5ec4f3');
  }

  async shorten(url: string): Promise<string> {
    const response = await this.bitly.shorten(url);
    return response.link;
  }
}
