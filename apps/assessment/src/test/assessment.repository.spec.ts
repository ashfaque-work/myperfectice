// import { getModelToken } from "@nestjs/mongoose"
// import { Test } from "@nestjs/testing"
// import { FilterQuery } from "mongoose"
// import { PracticeSetModel } from "./support/practiceSet.model"
// import { assessmentStub } from "./stubs/assessment.stub"
// import { ObjectId } from "mongodb"
// import { log } from "console"
// import { PracticeSet, PracticeSetRepository } from "@app/common"

// describe('PracticeSetRepository', () => {
//   let assessmentRepository: PracticeSetRepository;

//   describe('find operations', () => {
//     let assessmentModel: PracticeSetModel;
//     let assessmentFilterQuery: FilterQuery<PracticeSet>;

//     beforeEach(async () => {
//       const moduleRef = await Test.createTestingModule({
//         providers: [
//           PracticeSetRepository,
//           {
//             provide: getModelToken(PracticeSet.name),
//             useClass: PracticeSetModel
//           }
//         ]
//       }).compile();

//       assessmentRepository = moduleRef.get<PracticeSetRepository>(PracticeSetRepository);
//       assessmentModel = moduleRef.get<PracticeSetModel>(getModelToken(PracticeSet.name));

//       assessmentFilterQuery = { _id: assessmentStub().response._id };

//       jest.clearAllMocks();
//     })

//     describe('findOne', () => {
//       describe('when findOne is called', () => {
//         let assessment: PracticeSet;

//         beforeEach(async () => {
//           jest.spyOn(assessmentModel, 'findOne');
//           assessment = await assessmentRepository.findOne(assessmentFilterQuery);
//         })

//         test('then it should call the assessmentModel', () => {
//           expect(assessmentModel.findOne(assessmentFilterQuery));
//         })

//         test('then it should return a assessment', () => {
//           expect(assessment).toEqual(assessmentStub());
//         })
//       })
//     })

//     describe('find', () => {
//       describe('when find is called', () => {
//         let assessments: PracticeSet[];

//         beforeEach(async () => {
//           jest.spyOn(assessmentModel, 'find');
//           assessments = await assessmentRepository.find({});
//         })

//         test('then it should call the assessmentModel', () => {
//           expect(assessmentModel.find({}));
//         })

//         test('then it should return a assessment', () => {
//           expect(assessments).toEqual([assessmentStub()]);
//         })
//       })
//     })

//     describe('findOneAndUpdate', () => {
//       describe('when findOneAndUpdate is called', () => {
//         let assessment: PracticeSet;

//         beforeEach(async () => {
//           jest.spyOn(assessmentModel, 'findOneAndUpdate');
//           assessment = await assessmentRepository.findOneAndUpdate(assessmentFilterQuery, assessmentStub());
//         })

//         test('then it should call the assessmentModel', () => {
//           expect(assessmentModel.findOneAndUpdate(assessmentFilterQuery, assessmentStub(), { new: true }));
//         })

//         test('then it should return a assessment', () => {
//           expect(assessment).toEqual(assessmentStub());
//         })
//       })
//     })
//   })

//   // describe('create operations', () => {
//   //   beforeEach(async () => {
//   //     const moduleRef = await Test.createTestingModule({
//   //       providers: [
//   //         PracticeSetRepository,
//   //         {
//   //           provide: getModelToken(PracticeSet.name),
//   //           useValue: PracticeSetModel,
//   //         },
//   //       ],
//   //     }).compile();

//   //     assessmentRepository = moduleRef.get<PracticeSetRepository>(PracticeSetRepository);
//   //   });

//   // describe('create', () => {
//   //   describe('when create is called', () => {
//   //     let assessment: PracticeSet;
//   //     let saveSpy: jest.SpyInstance;
//   //     let constructorSpy: jest.SpyInstance;

//   //     beforeEach(async () => {
//   //       saveSpy = jest.spyOn(PracticeSetModel.prototype, 'save');
//   //       constructorSpy = jest.spyOn(PracticeSetModel.prototype, 'constructorSpy');

//   //       const data = assessmentStub().response;
//   //       delete data._id;

//   //       const convertedData = {
//   //         ...data,
//   //         user: new ObjectId(data.user),
//   //         lastModifiedBy: new ObjectId(data.lastModifiedBy),
//   //         userInfo: {
//   //           ...data.userInfo,
//   //           _id: new ObjectId(data.userInfo._id), 
//   //         },
//   //         units: data.units.map((unit) => ({
//   //           ...unit,
//   //           _id: new ObjectId(unit._id),
//   //         })),
//   //         subjects: data.subjects.map((subject) => ({
//   //           ...subject,
//   //           _id: new ObjectId(subject._id),
//   //         })),
//   //         courses: data.courses.map((courseId: string) => new ObjectId(courseId)),
//   //         testseries: data.testseries.map((testId: string) => new ObjectId(testId)),
//   //         classRooms: data.classRooms.map((classRoomId: string) => new ObjectId(classRoomId)),
//   //         locations: data.locations.map((locationId: string) => new ObjectId(locationId)),
//   //         adaptiveTest: new ObjectId(data.adaptiveTest),
//   //         randomTestDetails: data.randomTestDetails.map((randomTestDetail) => ({
//   //           ...randomTestDetail,
//   //           topic: new ObjectId(randomTestDetail.topic),
//   //         })),
//   //         questions: data.questions.map((question) => ({
//   //           ...question,
//   //           question: new ObjectId(question.question),
//   //         })),
//   //         buyers: data.buyers.map((buyer) => ({
//   //           ...buyer,
//   //           item: new ObjectId(buyer.item),
//   //           user: new ObjectId(buyer.user),
//   //         })),
//   //         instructors: data.instructors.map((instructorId: string) => new ObjectId(instructorId)),
//   //         owner: new ObjectId(data.owner),
//   //       };

//   //       assessment = await assessmentRepository.create(convertedData);
//   //       console.log(assessment);
//   //     })

//   //     test('then it should call the assessmentModel', () => {
//   //       expect(saveSpy).toHaveBeenCalled();
//   //       expect(constructorSpy).toHaveBeenCalledWith(assessmentStub())
//   //     })

//   //     test('then it should return a assessment', () => {
//   //       expect(assessment).toEqual(assessmentStub());
//   //     })
//   //   })
//   // })
//   // })
// })