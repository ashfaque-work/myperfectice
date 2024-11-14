// import { getModelToken } from "@nestjs/mongoose";
// import { Test } from "@nestjs/testing";
// import { questionFeedbackStub } from "./stub/questionFeedback.stub";
// import { QuestionFeedback } from "../../models";
// import { QuestionFeedbackRepository } from "../question-bank";
// import { FilterQuery } from "mongoose";
// import { QuestionFeedbackModel } from "./support/questionFeeedback.model";

// describe('QuestionFeedbackRepository', () => {
//     let questionFeedbackRepository: QuestionFeedbackRepository;

//     describe('find operations', () => {
//         let questionFeedbackModel: QuestionFeedbackModel;
//         let questionFeedbackFilterQuery: FilterQuery<QuestionFeedback>;
    
//         beforeEach(async () => {
//           const moduleRef = await Test.createTestingModule({
//             providers: [
//               QuestionFeedbackRepository,
//               {
//                 provide: getModelToken(QuestionFeedback.name),
//                 useClass: QuestionFeedbackModel
//               }
//             ]
//           }).compile();
    
//           questionFeedbackRepository = moduleRef.get<QuestionFeedbackRepository>(QuestionFeedbackRepository);
//           questionFeedbackModel = moduleRef.get<QuestionFeedbackModel>(getModelToken(QuestionFeedback.name));
    
//           questionFeedbackFilterQuery = { _id: questionFeedbackStub()._id };
    
//           jest.clearAllMocks();
//         })
    
//         describe('findOne', () => {
//           describe('when findOne is called', () => {
//             let questionFeedback: QuestionFeedback;
    
//             beforeEach(async () => {
//               jest.spyOn(questionFeedbackModel, 'findOne');
//               questionFeedback = await questionFeedbackRepository.findOne(questionFeedbackFilterQuery);
//             })
    
//             test('then it should call the questionFeedbackModel', () => {
//               expect(questionFeedbackModel.findOne(questionFeedbackFilterQuery));
//             })
    
//             test('then it should return a questionFeedback', () => {
//               expect(questionFeedback).toEqual(questionFeedbackStub());
//             })
//           })
//         })
    
//         describe('find', () => {
//           describe('when find is called', () => {
//             let questionFeedbacks: QuestionFeedback[];
    
//             beforeEach(async () => {
//               jest.spyOn(questionFeedbackModel, 'find');
//               questionFeedbacks = await questionFeedbackRepository.find({});
//             })
    
//             test('then it should call the questionFeedbackModel', () => {
//               expect(questionFeedbackModel.find({}));
//             })
    
//             test('then it should return a questionFeedback', () => {
//               expect(questionFeedbacks).toEqual([questionFeedbackStub()]);
//             })
//           })
//         })
    
//         describe('findOneAndUpdate', () => {
//           describe('when findOneAndUpdate is called', () => {
//             let questionFeedback: QuestionFeedback;
    
//             beforeEach(async () => {
//               jest.spyOn(questionFeedbackModel, 'findOneAndUpdate');
//               questionFeedback = await questionFeedbackRepository.findOneAndUpdate(questionFeedbackFilterQuery, questionFeedbackStub());
//             })
    
//             test('then it should call the questionFeedbackModel', () => {
//               expect(questionFeedbackModel.findOneAndUpdate(questionFeedbackFilterQuery, questionFeedbackStub(), { new: true }));
//             })
    
//             test('then it should return a questionFeedback', () => {
//               expect(questionFeedback).toEqual(questionFeedbackStub());
//             })
//           })
//         })
//       })

//     // describe('create operations', () => {
//     //     beforeEach(async () => {
//     //         const moduleRef = await Test.createTestingModule({
//     //             providers: [
//     //                 QuestionFeedbackRepository,
//     //                 {
//     //                     provide: getModelToken(QuestionFeedback.name),
//     //                     useValue: QuestionFeedbackModel,
//     //                 },
//     //             ],
//     //         }).compile();

//     //         questionFeedbackRepository = moduleRef.get<QuestionFeedbackRepository>(QuestionFeedbackRepository);
//     //     })
//     //     let questionFeedback: QuestionFeedback;
//     //     let saveSpy: jest.SpyInstance;
//     //     let constructorSpy: jest.SpyInstance;


//     //     beforeEach(async () => {
//     //         saveSpy = jest.spyOn(QuestionFeedbackModel.prototype, 'save');
//     //         constructorSpy = jest.spyOn(QuestionFeedbackModel.prototype, 'constructorSpy');
//     //         questionFeedback = await questionFeedbackRepository.create(questionFeedbackStub());

//     //     })
//     //     /*
//     //     * *  Problem with _id and .toJson()
//     //      */
//     //     test('then it should call the questionFeedbackModel', () => {
//     //         expect(saveSpy).toHaveBeenCalled();
//     //         expect(constructorSpy).toHaveBeenCalledWith(questionFeedbackStub());
//     //     })
//     //     /* 
//     //     * * Works if .toJson() is removed from AbstractRepository
//     //     */
//     //     test('then it should return a questionFeedbackModel', () => {
//     //     //     expect(questionFeedback).toMatchObject(questionFeedbackStub());
//     //     })
//     // })
// })