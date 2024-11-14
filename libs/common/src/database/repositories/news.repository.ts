import { Injectable, Logger } from "@nestjs/common"
import { AbstractRepository } from "../abstract.repository"
import { News } from "../models"
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"
import { instanceKeys } from '@app/common/config';

@Injectable()
export class NewsRepository extends AbstractRepository<News> {
    protected readonly logger = new Logger(NewsRepository.name);
    static conn = instanceKeys;

    constructor(
        @InjectModel(News.name, NewsRepository.conn[0] ? NewsRepository.conn[0] : 'staging') conn0: Model<News>,
        @InjectModel(News.name, NewsRepository.conn[1] ? NewsRepository.conn[1] : 'staging') conn1: Model<News>,
        @InjectModel(News.name, NewsRepository.conn[2] ? NewsRepository.conn[2] : 'staging') conn2: Model<News>,
        @InjectModel(News.name, NewsRepository.conn[3] ? NewsRepository.conn[3] : 'staging') conn3: Model<News>,
        @InjectModel(News.name, NewsRepository.conn[4] ? NewsRepository.conn[4] : 'staging') conn4: Model<News>,
        @InjectModel(News.name, NewsRepository.conn[5] ? NewsRepository.conn[5] : 'staging') conn5: Model<News>,
        @InjectModel(News.name, NewsRepository.conn[6] ? NewsRepository.conn[6] : 'staging') conn6: Model<News>,
        @InjectModel(News.name, NewsRepository.conn[7] ? NewsRepository.conn[7] : 'staging') conn7: Model<News>,
        @InjectModel(News.name, NewsRepository.conn[8] ? NewsRepository.conn[8] : 'staging') conn8: Model<News>,
        @InjectModel(News.name, NewsRepository.conn[9] ? NewsRepository.conn[9] : 'staging') conn9: Model<News>,
    ) {
        super({
            [NewsRepository.conn.at(0)]: conn0,
            [NewsRepository.conn.at(1)]: conn1,
            [NewsRepository.conn.at(2)]: conn2,
            [NewsRepository.conn.at(3)]: conn3,
            [NewsRepository.conn.at(4)]: conn4,
            [NewsRepository.conn.at(5)]: conn5,
            [NewsRepository.conn.at(6)]: conn6,
            [NewsRepository.conn.at(7)]: conn7,
            [NewsRepository.conn.at(8)]: conn8,
            [NewsRepository.conn.at(9)]: conn9,
        })
    }

    setInstanceKey(instancekey: string) {
        AbstractRepository.instancekey = instancekey;
    }
}

