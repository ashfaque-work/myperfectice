import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter } from 'events';
import * as _ from 'lodash';

@Injectable()
export class EventBus extends EventEmitter {
  private queue: any[] = [];
  private useQueue: string[] = [];
  private current: any = null;
  private nest: any = null;
  private queueCheck: number = 0;

  constructor() {
    super();
    this.setMaxListeners(30); // Increase max listeners
  }

  emit(eventName: string, ...args: any[]): boolean {
    Logger.debug('Emitting ' + eventName + '...');
    if (eventName.includes('::')) {
      let emitted = false;
      const nest = (eventName: string, level: number) => {
        const tmpEvent = eventName.split('::').slice(0, level).join('::');
        const result = super.emit(tmpEvent, ...args);
        emitted = emitted || result;
        if (tmpEvent !== eventName) {
          nest(eventName, ++level);
        }
      };
      nest(eventName, 1);
      return emitted;
    } else {
      return super.emit(eventName, ...args);
    }
  }

  use(eventName: string, listener: (...args: any[]) => void) {
    this.useQueue.push(eventName);
    this.onSeries(eventName, listener);
  }

  private onSeries(eventName: string, listener: (...args: any[]) => void) {
    super.on(eventName, (data: any) => {
      if (listener.length !== 2) {
        listener(data);
      } else {
        this.queue.push({ data, listener, eventName, arguments });
        this.next();
      }
    });
  }

  private next() {
    const item = this.queue[0];
    if (!item) {
      if (this.nest && typeof this.nest === 'function') {
        this.nest();
      }
      this.emit('bus:queue-empty', {});
      return;
    }

    if (item !== this.current) {
      this.current = item;
      item.listener(item.data, (err: Error, result: any) => {
        if (err) {
          throw err;
        }

        if (!_.isEmpty(result)) {
          _.extend(this.queue[0].data, result);
        }
        this.queue.shift();
        this.current = this.nest = null;
        if (this.useQueue.includes(item.eventName)) {
          this.useQueue.shift();
        }

        if (!this.queue.length && !this.useQueue.includes(item.eventName)) {
          const argsArr = Array.from(item.arguments);
          this.nest = argsArr[argsArr.length - 1];
        }

        if (this.queue.length <= this.queueCheck) {
          this.queueCheck -= 200;
          if (this.queueCheck < 0) {
            this.queueCheck = 0;
          }
          setTimeout(() => {
            this.next();
          }, 0);
        } else {
          this.queueCheck = Math.floor(this.queue.length / 200) * 200;
          this.next();
        }
      });
    }
  }
}
