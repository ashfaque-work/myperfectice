import { Injectable } from "@nestjs/common";
import { NotificationRepository } from "../database";
import * as libphonenumber from 'libphonenumber-js';

@Injectable()
export class SMSBus {
  constructor(private readonly notificationRepository: NotificationRepository) { }

  async findValidPhoneNumber(phones: string[]): Promise<{ phone: string[]; notValidatePhone: string[] }> {
    const validate: string[] = [];
    const notValidatePhone: string[] = [];

    phones.forEach((phone) => {
      if (libphonenumber.isValidPhoneNumber('+' + phone)) {
        validate.push(phone);
      } else {
        notValidatePhone.push(phone);
      }
    });

    return { phone: validate, notValidatePhone };
  }

  async getPhoneNumberByUsers(users: any[]): Promise<string[]> {
    const phoneNumberToSend: string[] = [];

    users.forEach((user) => {
      let userPhoneNumber = user.phoneNumber ? user.phoneNumber : user.userId;

      if (!user.phoneNumberFull) {
        if (!user.country || !user.country.callingCodes || user.country.callingCodes.length === 0) {
          return;
        }
        const callingCode = user.country.callingCodes[0];
        userPhoneNumber = callingCode + userPhoneNumber;
      } else {
        userPhoneNumber = user.phoneNumberFull;
      }

      phoneNumberToSend.push(userPhoneNumber);
    });

    return phoneNumberToSend;
  }

  async sendSmsToUser(ik:string, users: any[], text: string): Promise<void> {
    const phoneNumberToSend: string[] = [];

    users.forEach((user) => {
      let userPhoneNumber = user.phoneNumber ? user.phoneNumber : user.userId;

      if (!user.phoneNumberFull) {
        if (!user.country || !user.country.callingCodes || user.country.callingCodes.length === 0) {
          return;
        }
        const callingCode = user.country.callingCodes[0];
        userPhoneNumber = callingCode + userPhoneNumber;
      } else {
        userPhoneNumber = user.phoneNumberFull;
      }

      phoneNumberToSend.push(userPhoneNumber);
    });

    if (phoneNumberToSend.length === 0) {
      return;
    }

    const uniquePhones = [...new Set(phoneNumberToSend)];

    await Promise.all(
      uniquePhones.map(async (phone) => {
        this.notificationRepository.setInstanceKey(ik);
        await this.notificationRepository.create({
          modelId: 'sms',
          isScheduled: true,
          isEmail: false,
          to: phone,
          sms: text,
        });
      }),
    );
  }
}
