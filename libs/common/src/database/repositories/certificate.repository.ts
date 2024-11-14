import { AbstractRepository } from '../abstract.repository';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { instanceKeys } from '@app/common/config';
import { Certificate } from '../models';

@Injectable()
export class CertificateRepository extends AbstractRepository<Certificate> {
    protected readonly logger = new Logger(CertificateRepository.name);
    static conn = instanceKeys;

    constructor(
        @InjectModel(Certificate.name, CertificateRepository.conn[0] ? CertificateRepository.conn[0] : 'staging') conn0: Model<Certificate>,
        @InjectModel(Certificate.name, CertificateRepository.conn[1] ? CertificateRepository.conn[1] : 'staging') conn1: Model<Certificate>,
        @InjectModel(Certificate.name, CertificateRepository.conn[2] ? CertificateRepository.conn[2] : 'staging') conn2: Model<Certificate>,
        @InjectModel(Certificate.name, CertificateRepository.conn[3] ? CertificateRepository.conn[3] : 'staging') conn3: Model<Certificate>,
        @InjectModel(Certificate.name, CertificateRepository.conn[4] ? CertificateRepository.conn[4] : 'staging') conn4: Model<Certificate>,
        @InjectModel(Certificate.name, CertificateRepository.conn[5] ? CertificateRepository.conn[5] : 'staging') conn5: Model<Certificate>,
        @InjectModel(Certificate.name, CertificateRepository.conn[6] ? CertificateRepository.conn[6] : 'staging') conn6: Model<Certificate>,
        @InjectModel(Certificate.name, CertificateRepository.conn[7] ? CertificateRepository.conn[7] : 'staging') conn7: Model<Certificate>,
        @InjectModel(Certificate.name, CertificateRepository.conn[8] ? CertificateRepository.conn[8] : 'staging') conn8: Model<Certificate>,
        @InjectModel(Certificate.name, CertificateRepository.conn[9] ? CertificateRepository.conn[9] : 'staging') conn9: Model<Certificate>,
    ) {
        super({
            [CertificateRepository.conn.at(0)]: conn0,
            [CertificateRepository.conn.at(1)]: conn1,
            [CertificateRepository.conn.at(2)]: conn2,
            [CertificateRepository.conn.at(3)]: conn3,
            [CertificateRepository.conn.at(4)]: conn4,
            [CertificateRepository.conn.at(5)]: conn5,
            [CertificateRepository.conn.at(6)]: conn6,
            [CertificateRepository.conn.at(7)]: conn7,
            [CertificateRepository.conn.at(8)]: conn8,
            [CertificateRepository.conn.at(9)]: conn9,
        })
    }

    setInstanceKey(instancekey: string) {
        AbstractRepository.instancekey = instancekey;
    }
}


