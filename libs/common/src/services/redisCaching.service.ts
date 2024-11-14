import { Injectable, Logger } from "@nestjs/common";
import { SettingRepository } from "../database";
import { RedisClient } from "./redisClient.service";



@Injectable()
export class RedisCaching {

    constructor(private readonly settingRepository: SettingRepository, private readonly redist: RedisClient) { }

    private getKey(keys) {
        let key = ''
        if (keys.length > 0) {
            for (let i = 0; i < keys.length; i++) {
                if (key == '') {
                    key = key + keys[i]
                } else {
                    key = key + ',key=' + keys[i]
                }
            }
        }
        return key
    }

    async globalSet(key, value, callback?) {
        this.redist.set(key, JSON.stringify(value), function () {
            callback && callback()
        })
    }

    async globalSetex(key, value, expireTime, callback?) {
        this.redist.setex(key, JSON.stringify(value), expireTime, function () {
            callback && callback()
        })
    }

    async globalGet(key, callback) {
        this.redist.get(key, function (err, result) {
            if (err) callback(null)
            else if (result)
                callback(JSON.parse(result))
            else {
                callback()
            }
        })
    }

    async globalGetAsync(key, json = true) {
        let self = this;
        console.log("In redis server globalGetAsync")
        let returnVal;
        await new Promise((resolve, reject) => {
            self.redist.get(key, function (err, result) {
                console.log("result:", result);
                if (err) {
                    reject(err)
                }
                if (result) {
                    returnVal = json ? JSON.parse(result) : result;
                    console.log("inside returnVal", returnVal)
                    resolve(json ? JSON.parse(result) : result)
                } else {
                    return resolve(null);
                }
            })
        })
        console.log("returnVal", returnVal);
        return returnVal;
    }

    async globalDelAsync(key) {
        return new Promise((resolve, reject) => {
            this.redist.del(key, function (err, count) {
                if (err) {
                    return reject(err)
                }
                resolve(count)
            })
        })
    }

    async getAndSetOne(req, params, value, callback) {
        let expireTime = (60 * 60) * 12

        let firstParams = req.instancekey
        if (req.params) {
            if (req.params.id) {
                firstParams = firstParams + req.params.id

            }
        }
        let key = this.getKey([firstParams, params])
        let self = this;
        this.redist.get(key.toString(), function (err, result) {
            if (err) callback(null)
            else if (result)
                callback(JSON.parse(result))
            else {
                if (value != null) {
                    self.redist.setex(key.toString(), JSON.stringify(value), expireTime, function (err) {
                        callback(value)
                    })
                } else {
                    callback(value)
                }
            }
        })
    }

    async getAdaptiveQuestion(req, params, value, callback) {
        let expireTime = 60 * 60;
        let key = req.instancekey + req.user._id + params
        let self = this;
        this.redist.get(key.toString(), function (err, result) {
            if (err) callback(null)
            else if (result)
                callback(JSON.parse(result))
            else {
                if (value != null) {
                    self.redist.setex(key.toString(), JSON.stringify(value), expireTime, function (err) {
                        callback(value)
                    })
                } else {
                    callback(value)
                }
            }
        })
    }

    async get(req, params, callback) {
        let key = this.getKey([req.instancekey, params])
        this.redist.get(key.toString(), function (err, result) {
            if (err) callback(null)
            else if (result)
                callback(JSON.parse(result))
            else {
                callback()
            }
        })
    }

    async set(req, params, value, expireTime?, callback?) {
        let key = this.getKey([req.instancekey, params])
        if (expireTime) {
            // Set expiration time
            this.redist.setex(key.toString(), JSON.stringify(value), expireTime, function (err, reply) {
                if (err) {
                    Logger.error('fail to set redis ' + err)
                }
                console.log("Redis Set: ", reply)
                callback && callback()
            })
        } else {
            this.redist.set(key.toString(), JSON.stringify(value), function (err, reply) {
                if (err) {
                    Logger.error('fail to set redis ' + err)
                }
                console.log("Redis Set: ", reply)
                callback && callback()
            })
        }
    }

    async getAsync(ik, params) {
        return new Promise((resolve, reject) => {
            let key = this.getKey([ik, params])
            this.redist.get(key.toString(), function (err, result) {
                if (result) {
                    console.log("in result")
                    resolve(JSON.parse(result))
                } else {
                    console.log("in error")
                    resolve(null)
                }
            })
        })
    }

    async getSettingAsync(ik) {
        return new Promise((resolve, reject) => {
            let expireTime = (60 * 60) * 24
            let key = this.getKey([ik, 'whiteLabel'])
            let self = this
            // let returnVal;
            this.redist.get(key.toString(), async function (err, result) {
                if (!err && result) {
                    // returnVal = JSON.parse(result);
                    console.log('from the !err and result')
                    resolve(JSON.parse(result))
                }

                const doc = await self.settingRepository.findOne({ 'slug': 'whiteLabel' })

                if (!doc) {
                    reject()
                } else {
                    self.redist.setex(key.toString(), JSON.stringify(doc), expireTime, function (err, results) {
                        if (err) {
                            // Logger.error(err)
                        }
                        // returnVal = doc
                        resolve(doc)
                    })
                }

            })

            // return returnVal
        })
    }

    // async getSetting(req, callback) {

    // }

    async getSetting(req, callback?) {

        if (callback) {
            let expireTime = (60 * 60) * 24;
            let key = this.getKey([req.instancekey, 'whiteLabel']);
            const self = this;

            let returnVal;

            await new Promise((resolve, reject) => {
                this.redist.get(key.toString(), async function (err, result) {
                    if (!err && result) {
                        console.log("CACHED");
                        returnVal = callback(JSON.parse(result));
                        resolve(returnVal);
                    } else {
                        console.log("NOT CACHED");
                        const found = await self.settingRepository.findOne({ 'slug': 'whiteLabel' });
                        if (!found) {
                            returnVal = callback(null);
                            resolve(returnVal);
                        } else {
                            await self.redist.setex(key.toString(), JSON.stringify(found), expireTime, function (err, result) {
                                if (err) {
                                    console.log(err);
                                    reject(err);
                                }
                                returnVal = callback(found);
                                resolve(returnVal);
                            });
                        }
                    }
                });
            });

            return returnVal;
        } else {
            let expireTime = (60 * 60) * 24;
            let key = this.getKey([req.instancekey, 'whiteLabel']);
            const self = this;

            try {
                let result: string = await new Promise((resolve, reject) => {
                    this.redist.get(key.toString(), (err, result) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(result);
                        }
                    })
                })

                if (result) {
                    console.log("CACHED");
                    return JSON.parse(result);
                }

                console.log("NOT CACHED");

                this.settingRepository.setInstanceKey(req.instancekey)
                const found = await self.settingRepository.findOne({ 'slug': 'whiteLabel' });

                if (!found) {
                    return null;
                }

                await new Promise((resolve, reject) => {
                    self.redist.setex(key.toString(), JSON.stringify(found), expireTime, (err, result) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(result);
                        }
                    });
                });

                return found;
            } catch (error) {
                console.log(error);
                throw error;
            }
        }
    }

    async del(req, cacheKey, callback?) {
        let firstParams = req.instancekey
        if (req.params && req.params.id) {
            firstParams = firstParams + req.params.id
        }
        let key = this.getKey([firstParams, cacheKey])
        let self = this;
        this.redist.get(key, function (err, reply) {
            if (err) {
                // Logger.error(err)
                callback && callback(null)
            } else {
                self.redist.del(key, function (err, count) {
                    if (err) {
                        // Logger.error(err)
                    }
                    callback && callback(count)
                })
            }
        })
    }
}