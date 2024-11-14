import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { instanceKeys } from '@app/common/config';
import { AbstractRepository } from '../../abstract.repository';
import { Codesnippet } from '../../models';

@Injectable()
export class CodesnippetRepository extends AbstractRepository<Codesnippet> {
    protected readonly logger = new Logger(CodesnippetRepository.name);
    static conn = instanceKeys;

    constructor(
        @InjectModel(Codesnippet.name, CodesnippetRepository.conn[0] ? CodesnippetRepository.conn[0] : 'staging') conn0: Model<Codesnippet>,
        @InjectModel(Codesnippet.name, CodesnippetRepository.conn[1] ? CodesnippetRepository.conn[1] : 'staging') conn1: Model<Codesnippet>,
        @InjectModel(Codesnippet.name, CodesnippetRepository.conn[2] ? CodesnippetRepository.conn[2] : 'staging') conn2: Model<Codesnippet>,
        @InjectModel(Codesnippet.name, CodesnippetRepository.conn[3] ? CodesnippetRepository.conn[3] : 'staging') conn3: Model<Codesnippet>,
        @InjectModel(Codesnippet.name, CodesnippetRepository.conn[4] ? CodesnippetRepository.conn[4] : 'staging') conn4: Model<Codesnippet>,
        @InjectModel(Codesnippet.name, CodesnippetRepository.conn[5] ? CodesnippetRepository.conn[5] : 'staging') conn5: Model<Codesnippet>,
        @InjectModel(Codesnippet.name, CodesnippetRepository.conn[6] ? CodesnippetRepository.conn[6] : 'staging') conn6: Model<Codesnippet>,
        @InjectModel(Codesnippet.name, CodesnippetRepository.conn[7] ? CodesnippetRepository.conn[7] : 'staging') conn7: Model<Codesnippet>,
        @InjectModel(Codesnippet.name, CodesnippetRepository.conn[8] ? CodesnippetRepository.conn[8] : 'staging') conn8: Model<Codesnippet>,
        @InjectModel(Codesnippet.name, CodesnippetRepository.conn[9] ? CodesnippetRepository.conn[9] : 'staging') conn9: Model<Codesnippet>,
    ) {
        super({
            [CodesnippetRepository.conn.at(0)]: conn0,
            [CodesnippetRepository.conn.at(1)]: conn1,
            [CodesnippetRepository.conn.at(2)]: conn2,
            [CodesnippetRepository.conn.at(3)]: conn3,
            [CodesnippetRepository.conn.at(4)]: conn4,
            [CodesnippetRepository.conn.at(5)]: conn5,
            [CodesnippetRepository.conn.at(6)]: conn6,
            [CodesnippetRepository.conn.at(7)]: conn7,
            [CodesnippetRepository.conn.at(8)]: conn8,
            [CodesnippetRepository.conn.at(9)]: conn9,
        })
    }

    setInstanceKey(instancekey: string) {
        AbstractRepository.instancekey = instancekey;
    }
}


