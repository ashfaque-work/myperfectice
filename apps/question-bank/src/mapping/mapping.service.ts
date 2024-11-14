import { MappingRepository } from '@app/common';
import { VideoForPracticeSetRequest } from '@app/common/dto/question-bank.dto';
import { Injectable } from '@nestjs/common';
import { GrpcInternalException } from 'nestjs-grpc-exceptions';

@Injectable()
export class MappingService {
    constructor(private readonly mappingRepository: MappingRepository) { }

    /**
     * videoForPracticeSet grade profile
    */
    async videoForPracticeSet(req: VideoForPracticeSetRequest) {
        try {           
            this.mappingRepository.setInstanceKey(req.instancekey);
            const mappingsdata = await this.mappingRepository.distinct("provider");

            return mappingsdata;
        } catch (error) {
            console.log(error);
            throw new GrpcInternalException("Internal Server Error");
        }
    };
}