import { Injectable } from "@nestjs/common";
const Queue = require('bull');
import { AttemptSubmissionRepository } from "../database";
import { Logger } from "nestjs-pino";
import { config } from "../config";

let redisConfig: any = {}
redisConfig.redis = { port: config.redis.port, host: config.redis.host }
if (config.redis.password) {
    redisConfig.redis.password = config.redis.password
}

export const attemptQueue = new Queue('attempt submission', redisConfig)
