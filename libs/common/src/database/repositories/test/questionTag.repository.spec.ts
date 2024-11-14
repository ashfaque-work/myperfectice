// import { getModelToken } from "@nestjs/mongoose";
// import { Test } from "@nestjs/testing";
// import { QuestionTagModel } from "./support/questionTag.model";
// import { questionTagStub } from "./stub/questionTag.stub";
// import { QuestionTag } from "../../models";
// import { QuestionTagRepository } from "../question-bank";
// import { FilterQuery } from "mongoose";

// describe('QuestionTagRepository', () => {
//     let questionTagRepository: QuestionTagRepository;

//     describe('find operations', () => {
//         let questionTagModel: QuestionTagModel;
//         let questionTagFilterQuery: FilterQuery<QuestionTag>;
    
//         beforeEach(async () => {
//           const moduleRef = await Test.createTestingModule({
//             providers: [
//               QuestionTagRepository,
//               {
//                 provide: getModelToken(QuestionTag.name),
//                 useClass: QuestionTagModel
//               }
//             ]
//           }).compile();
    
//           questionTagRepository = moduleRef.get<QuestionTagRepository>(QuestionTagRepository);
//           questionTagModel = moduleRef.get<QuestionTagModel>(getModelToken(QuestionTag.name));
    
//           questionTagFilterQuery = { _id: questionTagStub()._id };
    
//           jest.clearAllMocks();
//         })
    
//         describe('findOne', () => {
//           describe('when findOne is called', () => {
//             let questionTag: QuestionTag;
    
//             beforeEach(async () => {
//               jest.spyOn(questionTagModel, 'findOne');
//               questionTag = await questionTagRepository.findOne(questionTagFilterQuery);
//             })
    
//             test('then it should call the questionTagModel', () => {
//               expect(questionTagModel.findOne(questionTagFilterQuery));
//             })
    
//             test('then it should return a questionTag', () => {
//               expect(questionTag).toEqual(questionTagStub());
//             })
//           })
//         })
    
//         describe('find', () => {
//           describe('when find is called', () => {
//             let questionTags: QuestionTag[];
    
//             beforeEach(async () => {
//               jest.spyOn(questionTagModel, 'find');
//               questionTags = await questionTagRepository.find({});
//             })
    
//             test('then it should call the questionTagModel', () => {
//               expect(questionTagModel.find({}));
//             })
    
//             test('then it should return a questionTag', () => {
//               expect(questionTags).toEqual([questionTagStub()]);
//             })
//           })
//         })
    
//         describe('findOneAndUpdate', () => {
//           describe('when findOneAndUpdate is called', () => {
//             let questionTag: QuestionTag;
    
//             beforeEach(async () => {
//               jest.spyOn(questionTagModel, 'findOneAndUpdate');
//               questionTag = await questionTagRepository.findOneAndUpdate(questionTagFilterQuery, questionTagStub());
//             })
    
//             test('then it should call the questionTagModel', () => {
//               expect(questionTagModel.findOneAndUpdate(questionTagFilterQuery, questionTagStub(), { new: true }));
//             })
    
//             test('then it should return a questionTag', () => {
//               expect(questionTag).toEqual(questionTagStub());
//             })
//           })
//         })
//       })

//     // describe('create operations', () => {
//     //     beforeEach(async () => {
//     //         const moduleRef = await Test.createTestingModule({
//     //             providers: [
//     //                 QuestionTagRepository,
//     //                 {
//     //                     provide: getModelToken(QuestionTag.name),
//     //                     useValue: QuestionTagModel,
//     //                 },
//     //             ],
//     //         }).compile();

//     //         questionTagRepository = moduleRef.get<QuestionTagRepository>(QuestionTagRepository);
//     //     })
//     //     let questionTag: QuestionTag;
//     //     let saveSpy: jest.SpyInstance;
//     //     let constructorSpy: jest.SpyInstance;


//     //     beforeEach(async () => {
//     //         saveSpy = jest.spyOn(QuestionTagModel.prototype, 'save');
//     //         constructorSpy = jest.spyOn(QuestionTagModel.prototype, 'constructorSpy');
//     //         questionTag = await questionTagRepository.create(questionTagStub());

//     //     })
//     //     /*
//     //     * *  Problem with _id and .toJson()
//     //      */
//     //     test('then it should call the questionTagModel', () => {
//     //         expect(saveSpy).toHaveBeenCalled();
//     //         expect(constructorSpy).toHaveBeenCalledWith(questionTagStub());
//     //     })
//     //     /* 
//     //     * * Works if .toJson() is removed from AbstractRepository
//     //     */
//     //     test('then it should return a questionTagModel', () => {
//     //         expect(questionTag).toMatchObject(questionTagStub());
//     //     })
//     // })
// })