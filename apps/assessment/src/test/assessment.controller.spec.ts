// import { Test } from "@nestjs/testing"

// import { AssessmentController } from "../assessment.controller"
// import { AssessmentService } from "../assessment.service"
// import { assessmentStub, updateAllQuestionSectionRequestStub, updateAllQuestionSectionResponseStub } from "./stubs/assessment.stub";
// import { GetAssessmentResponse, UpdateAllQuestionSectionRequest } from "@app/common/dto/assessment.dto";

// jest.mock('../assessment.service');

// describe('AssessmentController', () => {
//   let assessmentController: AssessmentController;
//   let assessmentService: AssessmentService;

//   beforeEach(async () => {
//     const moduleRef = await Test.createTestingModule({
//       imports: [],
//       controllers: [AssessmentController],
//       providers: [AssessmentService]
//     }).compile();

//     assessmentController = moduleRef.get<AssessmentController>(AssessmentController);
//     assessmentService = moduleRef.get<AssessmentService>(AssessmentService);
//     jest.clearAllMocks();
//   })

//   describe('getAssessment', () => {
//     describe('when getAssessment is called', () => {
//       let assessment: GetAssessmentResponse;

//       beforeEach(async () => {
//         assessment = await assessmentController.getAssessment({ _id: assessmentStub().response._id }) 
//       })

//       test('then it should call assessmentService', () => {
//         expect(assessmentService.getAssessment({ _id: assessmentStub().response._id }));
//       })

//       test('then it should return an assessment', () => {
//         expect(assessment).toEqual(assessmentStub());
//       })
//     })
//   })

//   describe('updateAllQuestionSection', () => {
//     describe('when getAssessment is called', () => {
//       let assessment: any;

//       beforeEach(async () => {
//         assessment = await assessmentController.updateAllQuestionSection(updateAllQuestionSectionRequestStub()) 
//       })

//       test('then it should call assessmentService', () => {
//         expect(assessmentService.updateAllQuestionSection(updateAllQuestionSectionRequestStub()));
//       })

//       test('then it should return an assessment', () => {
//         expect(assessment).toEqual(updateAllQuestionSectionResponseStub());
//       })
//     })
//   })
// })