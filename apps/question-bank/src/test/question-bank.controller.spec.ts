// import { Test } from "@nestjs/testing"

// import { QuestionBankController } from "../question-bank.controller";
// import { QuestionBankService } from "../question-bank.service";
// import { QuestionDistributionCategoryResponse, QuestionMarksDto } from "@app/common/dto/question-bank.dto";
// import { getByPracticeStub, practiceIdStub, practiceSummaryBySubjectStub, questionDistributionByCategoryStub, questionDistributionByMarksStub, questionIdStub, questionUsedCountStub } from "./stubs/question.stub";

// jest.mock('../question-bank.service');

// describe('QuestionBankController', () => {
//   let questionBankController: QuestionBankController;
//   let questionBankService: QuestionBankService;

//   beforeEach(async () => {
//     const moduleRef = await Test.createTestingModule({
//       imports: [],
//       controllers: [QuestionBankController],
//       providers: [QuestionBankService]
//     }).compile();

//     questionBankController = moduleRef.get<QuestionBankController>(QuestionBankController);
//     questionBankService = moduleRef.get<QuestionBankService>(QuestionBankService);
//     jest.clearAllMocks();
//   })

//   describe('questionDistributionByCategory', () => {
//     describe('when questionDistributionByCategory is called', () => {
//       let result: any;

//       beforeEach(async () => {
//         result = await questionBankController.questionDistributionByCategory({_id: questionIdStub()._id});
        
//       })

//       test('then it should call questionBankService', () => {
//         expect(questionBankService.questionDistributionByCategory).toHaveBeenCalledWith({ _id: questionIdStub()._id });
//         // expect(questionBankService.questionDistributionByCategory({ _id: questionIdStub()._id }));
//       })

//       test('then it should return a result', () => {
//         expect(result).toEqual(questionDistributionByCategoryStub());
//       })
//     })
//   })

//   describe('questionDistributionByMarks', () => {
//     describe('when questionDistributionByMarks is called', () => {
//       let result: any;

//       beforeEach(async () => {
//         result = await questionBankController.questionDistributionByMarks({_id: questionIdStub()._id});
        
//       })

//       test('then it should call questionBankService', () => {
//         expect(questionBankService.questionDistributionByMarks).toHaveBeenCalledWith({ _id: questionIdStub()._id });
//       })

//       test('then it should return a result', () => {
//         expect(result).toEqual(questionDistributionByMarksStub());
//       })
//     })
//   })

//   describe('practiceSummaryBySubject', () => {
//     describe('when practiceSummaryBySubject is called', () => {
//       let result: any;

//       beforeEach(async () => {
//         result = await questionBankController.practiceSummaryBySubject({ practice: practiceIdStub().practice });
        
//       })

//       test('then it should call questionBankService', () => {
//         expect(questionBankService.practiceSummaryBySubject).toHaveBeenCalledWith({ practice: practiceIdStub().practice });
//       })

//       test('then it should return a result', () => {
//         expect(result).toEqual(practiceSummaryBySubjectStub());
//       })
//     })
//   })

//   describe('getByPractice', () => {
//     describe('when getByPractice is called', () => {
//       let result: any;

//       beforeEach(async () => {
//         result = await questionBankController.getByPractice({ practiceId: practiceIdStub().practice });
        
//       })

//       test('then it should call questionBankService', () => {
//         expect(questionBankService.getByPractice).toHaveBeenCalledWith({ practiceId: practiceIdStub().practice });
//       })

//       test('then it should return a result', () => {
//         expect(result).toEqual(getByPracticeStub());
//       })
//     })
//   })

//   describe('questionUsedCount', () => {
//     describe('when questionUsedCount is called', () => {
//       let result: any;

//       beforeEach(async () => {
//         result = await questionBankController.questionUsedCount();
        
//       })

//       test('then it should call questionBankService', () => {
//         expect(questionBankService.questionUsedCount).toHaveBeenCalledWith();
//       })

//       test('then it should return a result', () => {
//         expect(result).toEqual(questionUsedCountStub());
//       })
//     })
//   })
// })