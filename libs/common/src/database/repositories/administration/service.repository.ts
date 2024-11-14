import { AbstractRepository } from '../../abstract.repository';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Service } from '../../models';
import { instanceKeys } from '@app/common/config';

@Injectable()
export class ServiceRepository extends AbstractRepository<Service> {
  protected readonly logger = new Logger(ServiceRepository.name);
  static conn = instanceKeys;

  constructor(
    @InjectModel(Service.name, ServiceRepository.conn[0] ? ServiceRepository.conn[0] : 'staging') conn0: Model<Service>,
    @InjectModel(Service.name, ServiceRepository.conn[1] ? ServiceRepository.conn[1] : 'staging') conn1: Model<Service>,
    @InjectModel(Service.name, ServiceRepository.conn[2] ? ServiceRepository.conn[2] : 'staging') conn2: Model<Service>,
    @InjectModel(Service.name, ServiceRepository.conn[3] ? ServiceRepository.conn[3] : 'staging') conn3: Model<Service>,
    @InjectModel(Service.name, ServiceRepository.conn[4] ? ServiceRepository.conn[4] : 'staging') conn4: Model<Service>,
    @InjectModel(Service.name, ServiceRepository.conn[5] ? ServiceRepository.conn[5] : 'staging') conn5: Model<Service>,
    @InjectModel(Service.name, ServiceRepository.conn[6] ? ServiceRepository.conn[6] : 'staging') conn6: Model<Service>,
    @InjectModel(Service.name, ServiceRepository.conn[7] ? ServiceRepository.conn[7] : 'staging') conn7: Model<Service>,
    @InjectModel(Service.name, ServiceRepository.conn[8] ? ServiceRepository.conn[8] : 'staging') conn8: Model<Service>,
    @InjectModel(Service.name, ServiceRepository.conn[9] ? ServiceRepository.conn[9] : 'staging') conn9: Model<Service>,
  ){
    super({
      [ServiceRepository.conn.at(0)]: conn0,
      [ServiceRepository.conn.at(1)]: conn1,
      [ServiceRepository.conn.at(2)]: conn2,
      [ServiceRepository.conn.at(3)]: conn3,
      [ServiceRepository.conn.at(4)]: conn4,
      [ServiceRepository.conn.at(5)]: conn5,
      [ServiceRepository.conn.at(6)]: conn6,
      [ServiceRepository.conn.at(7)]: conn7,
      [ServiceRepository.conn.at(8)]: conn8,
      [ServiceRepository.conn.at(9)]: conn9,
    })
  }

  setInstanceKey(instancekey: string) {
    AbstractRepository.instancekey = instancekey;
  }
}


