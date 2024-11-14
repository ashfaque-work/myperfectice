import { Injectable, Logger } from "@nestjs/common";
import { AbstractRepository } from "../abstract.repository";
import { instanceKeys } from "@app/common/config";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Device } from "../models";

@Injectable()
export class DeviceRepository extends AbstractRepository<Device> {
  protected readonly logger = new Logger(DeviceRepository.name);
  static conn = instanceKeys;

  constructor(
    @InjectModel(Device.name, DeviceRepository.conn[0] ? DeviceRepository.conn[0] : 'staging') conn0: Model<Device>,
    @InjectModel(Device.name, DeviceRepository.conn[1] ? DeviceRepository.conn[1] : 'staging') conn1: Model<Device>,
    @InjectModel(Device.name, DeviceRepository.conn[2] ? DeviceRepository.conn[2] : 'staging') conn2: Model<Device>,
    @InjectModel(Device.name, DeviceRepository.conn[3] ? DeviceRepository.conn[3] : 'staging') conn3: Model<Device>,
    @InjectModel(Device.name, DeviceRepository.conn[4] ? DeviceRepository.conn[4] : 'staging') conn4: Model<Device>,
    @InjectModel(Device.name, DeviceRepository.conn[5] ? DeviceRepository.conn[5] : 'staging') conn5: Model<Device>,
    @InjectModel(Device.name, DeviceRepository.conn[6] ? DeviceRepository.conn[6] : 'staging') conn6: Model<Device>,
    @InjectModel(Device.name, DeviceRepository.conn[7] ? DeviceRepository.conn[7] : 'staging') conn7: Model<Device>,
    @InjectModel(Device.name, DeviceRepository.conn[8] ? DeviceRepository.conn[8] : 'staging') conn8: Model<Device>,
    @InjectModel(Device.name, DeviceRepository.conn[9] ? DeviceRepository.conn[9] : 'staging') conn9: Model<Device>,
  ) {
    super({
      [DeviceRepository.conn.at(0)]: conn0,
      [DeviceRepository.conn.at(1)]: conn1,
      [DeviceRepository.conn.at(2)]: conn2,
      [DeviceRepository.conn.at(3)]: conn3,
      [DeviceRepository.conn.at(4)]: conn4,
      [DeviceRepository.conn.at(5)]: conn5,
      [DeviceRepository.conn.at(6)]: conn6,
      [DeviceRepository.conn.at(7)]: conn7,
      [DeviceRepository.conn.at(8)]: conn8,
      [DeviceRepository.conn.at(9)]: conn9,
    })
  }

  setInstanceKey(instancekey: string) {
    AbstractRepository.instancekey = instancekey;
  }
}