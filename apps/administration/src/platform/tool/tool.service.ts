import { Injectable, Logger } from '@nestjs/common';
import { RedisCaching } from '@app/common';
import { GrpcInternalException } from 'nestjs-grpc-exceptions';
import { GetContactReq, ImportGSTReq } from '@app/common/dto/administration';
import { MessageCenter } from '@app/common/components/messageCenter';
import * as async from 'async';
import * as fs from 'fs';
import * as xml2js from 'xml2js';
import { promisify } from 'util';


const parseString = promisify(xml2js.parseString);

@Injectable()
export class ToolService {
  constructor(
    private readonly redisCaching: RedisCaching,
    private readonly messageCenter: MessageCenter
  ) { }

  async importGST(request: ImportGSTReq): Promise<any> {
    try {

      // return new Promise((resolve, reject) => {
      //   fs.writeFileSync('/tmp/uploadedFile.xml', request.file);
      //   fs.readFile('/tmp/uploadedFile.xml', async (err, fileData) => {
      //     if (err) {
      //       Logger.error('Error reading file:', err);
      //       return reject(err);
      //     }

      //     try {
      //       const result = await parseString(fileData);
      //       if (!result || !result.examinations || !result.examinations.examination) {
      //         return reject(new Error('No data to create'));
      //       }

      //       async.map(
      //         result.examinations.examination,
      //         (examination, cb) => {
      //           // this.createGrade(request.instancekey, request.countryCode, examination)
      //             // .then(results => cb(null, results))
      //             // .catch(error => cb(error));
      //         },
      //         (err) => {
      //           if (err) {
      //             Logger.error('Error in async map:', err);
      //             return reject(err);
      //           }
      //           resolve('Import successful');
      //         }
      //       );
      //     } catch (parseError) {
      //       Logger.error('Error parsing XML:', parseError);
      //       return reject(parseError);
      //     }
      //   });
      // });

      return {}
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

  async getContact(request: GetContactReq): Promise<any> {
    try {
      const data = { contact: request.contact, subject: 'Contact' };

      const settings = await this.redisCaching.getSetting(request);

      const dataMsgCenter = {
        to: settings.supportEmail,
        modelId: 'contact',
        isScheduled: true
      };

      await this.messageCenter.sendWithTemplate(request, 'feedBack-perfectice', data, dataMsgCenter);

      return;
    } catch (error) {
      throw new GrpcInternalException(error.message);
    }
  }

}
