import { Injectable, Logger } from "@nestjs/common";
import { AbstractRepository } from "../abstract.repository";
import { instanceKeys } from "@app/common/config";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Events } from "../models";

@Injectable()
export class EventsRepository extends AbstractRepository<Events> {
  protected readonly logger = new Logger(EventsRepository.name);
  static conn = instanceKeys;

  constructor(
    @InjectModel(Events.name, EventsRepository.conn[0] ? EventsRepository.conn[0] : 'staging') conn0: Model<Events>,
    @InjectModel(Events.name, EventsRepository.conn[1] ? EventsRepository.conn[1] : 'staging') conn1: Model<Events>,
    @InjectModel(Events.name, EventsRepository.conn[2] ? EventsRepository.conn[2] : 'staging') conn2: Model<Events>,
    @InjectModel(Events.name, EventsRepository.conn[3] ? EventsRepository.conn[3] : 'staging') conn3: Model<Events>,
    @InjectModel(Events.name, EventsRepository.conn[4] ? EventsRepository.conn[4] : 'staging') conn4: Model<Events>,
    @InjectModel(Events.name, EventsRepository.conn[5] ? EventsRepository.conn[5] : 'staging') conn5: Model<Events>,
    @InjectModel(Events.name, EventsRepository.conn[6] ? EventsRepository.conn[6] : 'staging') conn6: Model<Events>,
    @InjectModel(Events.name, EventsRepository.conn[7] ? EventsRepository.conn[7] : 'staging') conn7: Model<Events>,
    @InjectModel(Events.name, EventsRepository.conn[8] ? EventsRepository.conn[8] : 'staging') conn8: Model<Events>,
    @InjectModel(Events.name, EventsRepository.conn[9] ? EventsRepository.conn[9] : 'staging') conn9: Model<Events>,
  ) {
    super({
      [EventsRepository.conn.at(0)]: conn0,
      [EventsRepository.conn.at(1)]: conn1,
      [EventsRepository.conn.at(2)]: conn2,
      [EventsRepository.conn.at(3)]: conn3,
      [EventsRepository.conn.at(4)]: conn4,
      [EventsRepository.conn.at(5)]: conn5,
      [EventsRepository.conn.at(6)]: conn6,
      [EventsRepository.conn.at(7)]: conn7,
      [EventsRepository.conn.at(8)]: conn8,
      [EventsRepository.conn.at(9)]: conn9,
    })
  }

  setInstanceKey(instancekey: string) {
    AbstractRepository.instancekey = instancekey;
  }
}