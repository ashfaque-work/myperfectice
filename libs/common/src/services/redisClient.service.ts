// redis.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import redisMock from 'ioredis-mock';
import * as dbConfig from '../config/local';
import { config } from '../config';

@Injectable()
export class RedisClient {

  private masterClient = null;
  private readClientPool = [];

  private getRandomArbitrary(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
  }

  private fakeClient = {
    get: function (key, cb) {
      cb(null, null);
    },
    set: function (key, value, command, commandArg, callback) {
      let cb = callback;
      if (!commandArg && !callback) {
        cb = command;
      }
      cb();
    },
    del: function (key, cb) {
      cb && cb();
    }
  };

  constructor(private readonly configService: ConfigService) {

    if (this.configService.get('REDIS_ISMOCK') == 'true') {
      console.log("CONNECTING TO MOCK")
      this.masterClient = new redisMock()
    } else {
      if (this.configService.get('REDIS_TYPE') == 'cluster') {
        console.log("CONNECTING TO CLUSTER")
        this.masterClient = new Redis.Cluster(config.redisCluster.cluster, {
          clusterRetryStrategy(times) {
            const delay = Math.min(times * 50, 30000);
            return delay;
          },
          scaleReads: "all",
          enableOfflineQueue: false,
          enableReadyCheck: true
        })
      } else if (this.configService.get('REDIS_TYPE') == 'masterSlaves') {
        console.log("CONNECTING TO MASTER SLAVES")
        let redisOpt: any = {
          retryStrategy(times) {
            const delay = Math.min(times * 50, 30000);
            return delay;
          },
          reconnectOnError(err) {
            const targetError = "READONLY";
            console.log("__________&&&&&&&&&&&&&&&&&________________")
            console.log(err.message)
            if (err.message.includes(targetError)) {
              // Only reconnect when the error contains "READONLY"
              return true; // or `return 1;`
            }
          },
          maxRetriesPerRequest: null,
          enableOfflineQueue: false,
          enableReadyCheck: true,
          keepAlive: 1000,
          connectTimeout: 10000
        }

        if (config.redisCluster.master.password) {
          redisOpt.password = config.redisCluster.master.password
        }

        this.masterClient = new Redis(`rediss://default:${config.redisCluster.master.password}@${config.redisCluster.master.host}:${config.redisCluster.master.port}`, redisOpt)

        if (config.redisCluster.slaves.length > 0) {
          config.redisCluster.slaves.forEach(s => {
            let client = new Redis(`rediss://default:${config.redisCluster.master.password}@${s.host}:${s.port}`, { readOnly: true });
            // let client = new Redis(s.port, s.host, { readOnly: true });
            client.on('ready', () => {
              console.log("^^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^")
              console.log(client);
              console.log("^^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^%^")
              this.readClientPool.push(client)
            })
          })
        }
      } else {
        console.log("CONNECTING TO ACTUAL REDIS")
        let redisOpt: any = {
          retryStrategy(times) {
            const delay = Math.min(times * 50, 30000);
            Logger.log(`Retry attempt ${times}. Reconnecting in ${delay} ms.`);
            return delay;
          },
          reconnectOnError(err) {
            const targetError = "READONLY";
            if (err.message.includes(targetError)) {
              // Only reconnect when the error contains "READONLY"
              return true; // or `return 1;`
            }
          },
          maxRetriesPerRequest: null,
          enableOfflineQueue: false,
          enableReadyCheck: true
        }

        if (configService.get('REDIS_PASS')) {
          redisOpt.password = configService.get('REDIS_PASS')
        }

        this.masterClient = new Redis(configService.get('REDIS_URI'), redisOpt);
      }
    }

    this.masterClient.on('ready', () => {
      Logger.log("REDIS CONNECTED")
      console.log("REDIS CONNECTED")
      this.fakeClient = null;
    })

    this.masterClient.on('error', (err) => {
      Logger.log("Retrying Redis Connection ...")
      this.getReadClient()
    })
  }

  private getReadClient(): any {
    if (this.fakeClient) {
      // console.log(this.fakeClient)
      return this.fakeClient;
    }
    if (this.readClientPool.length === 1) {
      // console.log(this.readClientPool[0])
      return this.readClientPool[0];
    }
    if (this.readClientPool.length) {
      const idx = this.getRandomArbitrary(0, this.readClientPool.length);
      // console.log(this.readClientPool[idx])
      return this.readClientPool[idx];
    }

    // console.log(this.masterClient)
    return this.masterClient;
  }

  private getMasterClient(): any {
    return this.fakeClient || this.masterClient;
  }

  public get(key: string, cb: (err: any, result: any) => void): void {
    // console.log(")()()()()()()()()()()()()()()(")
    // console.log(this.getReadClient());
    this.getReadClient().get(key, cb);
  }



  public set = function (key, value, command?, commandArg?, callback?) {
    let cb = callback;
    if (!commandArg && !callback) {
      cb = command;
      this.getMasterClient().set(key, value, cb);
    } else {
      this.getMasterClient().set(key, value, command, commandArg, cb);
    }
  };

  public setex(key, value, timeInSeconds, cb) {
    this.getMasterClient().set(key, value, 'EX', timeInSeconds, cb);
  }

  public del = function (key, callback) {
    this.getMasterClient().del(key, function (err, count) {
      if (err) {
        return callback(err);
      }
      callback(null, count);
    });
  };

  public getClient(): any {
    return this.fakeClient || this.masterClient;
  }

}