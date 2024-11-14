// import { PracticeQuestionsResponse, PracticeSummaryBySubjectResponse, QuestionDistributionCategoryResponse, QuestionDistributionMarksResponse, QuestionUsedCountResponse } from "@app/common/dto/question-bank.dto"


// export const questionDistributionByCategoryStub = (): QuestionDistributionCategoryResponse => {
//   return {
//     "response": [
//       {
//         "questions": [
//           {
//             "marks": 0,
//             "category": "mcq",
//             "count": 3
//           }
//         ],
//         "count": 3,
//         "category": "mcq"
//       }
//     ]
//   }
// }

// export const questionIdStub = () => {
//   return {
//     _id: "65f96546e87ab99918cfdaf0"
//   }
// }

// export const questionDistributionByMarksStub = (): QuestionDistributionMarksResponse => {
//   return {
//     "response": [
//       {
//         "category": "mcq",
//         "minusMark": 0,
//         "plusMark": 0
//       }
//     ]
//   }
// }

// export const practiceIdStub = () => {
//   return {
//     practice: "65f96546e87ab99918cfdaf0"
//   }
// }

// export const practiceSummaryBySubjectStub = (): PracticeSummaryBySubjectResponse => {
//   return {
//     "response": [
//       {
//         "_id": "5f684d0171adec4d1cf3f4b7",
//         "name": "Mathematics",
//         "units": [
//           {
//             "name": "string",
//             "count": 1,
//             "_id": "5f684d0171adec4d1cf3f4b7"
//           },
//           {
//             "name": "string",
//             "count": 1,
//             "_id": "5f684d0171adec4d1cf3f4b7"
//           },
//           {
//             "name": "string",
//             "count": 1,
//             "_id": "5f684d0171adec4d1cf3f4b7"
//           }
//         ],
//         "count": 3
//       }
//     ]
//   }
// }

// export const getByPracticeStub = (): PracticeQuestionsResponse => {
//   return {
//     "response": [
//       {
//         "_id": "65f02270e5eddd484abb8eeb",
//         "user": "5f684d0171adec4d1cf3f4b7",
//         "userRole": "student",
//         "practiceSets": [
//           "65f02270e5eddd484abb8ee9"
//         ],
//         "subject": {
//           "_id": "5f684d0171adec4d1cf3f4b7",
//           "name": "Mathematics"
//         },
//         "topic": {
//           "_id": "5f684d0171adec4d1cf3f4b7",
//           "name": "string"
//         },
//         "unit": {
//           "_id": "5f684d0171adec4d1cf3f4b7",
//           "name": "string"
//         },
//         "tags": [
//           "string"
//         ],
//         "complexity": "easy",
//         "questionType": "single",
//         "isAllowReuse": "global",
//         "moderation": {
//           "moderatedBy": "5f684d0171adec4d1cf3f4b7",
//           "moderationDate": new Date('1990-05-15T12:00:00Z')
//         },
//         "category": "mcq",
//         "questionText": "string",
//         "questionTextArray": [
//           "string"
//         ],
//         "audioFiles": [
//           {
//             "url": "string",
//             "name": "string",
//             "duration": 0
//           }
//         ],
//         "answerExplainArr": [
//           "string"
//         ],
//         "answerExplain": "string",
//         "answerExplainAudioFiles": [
//           {
//             "url": "string",
//             "name": "string",
//             "duration": 0
//           }
//         ],
//         "prefferedLanguage": [
//           "string"
//         ],
//         "questionHeader": "string",
//         "answerNumber": 0,
//         "minusMark": 0,
//         "plusMark": 0,
//         "createdAt": new Date('1990-05-15T12:00:00Z'),
//         "updatedAt": new Date('1990-05-15T12:00:00Z'),
//         "isActive": true,
//         "wordLimit": 0,
//         "partialMark": true,
//         "domain": "string",
//         "facet": 0,
//         "answers": [
//           {
//             "answerText": "string",
//             "answerTextArray": [
//               "string"
//             ],
//             "isCorrectAnswer": true,
//             "input": "string",
//             "marks": 0,
//             "score": 0,
//             "userText": "string",
//             "correctMatch": "string",
//             "audioFiles": [
//               {
//                 "url": "string",
//                 "name": "string",
//                 "duration": 0
//               }
//             ]
//           }
//         ],
//         "userInputDescription": "string",
//         "hasUserInput": true,
//         "argumentDescription": "string",
//         "hasArg": true,
//         "modelId": 0,
//         "tComplexity": 0,
//         "testcases": [
//           {
//             "isSample": true,
//             "args": "string",
//             "input": "string",
//             "output": "string"
//           }
//         ],
//         "coding": [
//           {
//             "language": "string",
//             "timeLimit": 0,
//             "memLimit": 0,
//             "template": "string",
//             "solution": "string"
//           }
//         ],
//         "approveStatus": "string",
//         "alternativeExplanations": [
//           {
//             "user": {
//               "_id": "65f02270e5eddd484abb8eea",
//               "name": "string"
//             },
//             "explanation": "string",
//             "isApproved": true
//           }
//         ],
//         "lastModifiedBy": "5f684d0171adec4d1cf3f4b7",
//         "uid": "5f684d0171adec4d1cf3f4b7",
//         "locations": ["5f684d0171adec4d1cf3f4b7"],
//         "section": "string",
//         "order": 0,
//         "canEdit": false
//       },
//       {
//         "_id": "65f0234192fc57ebc6020dce",
//         "user": "5f684d0171adec4d1cf3f4b7",
//         "userRole": "student",
//         "practiceSets": [
//           "65f0234192fc57ebc6020dcc"
//         ],
//         "subject": {
//           "_id": "5f684d0171adec4d1cf3f4b7",
//           "name": "Mathematics"
//         },
//         "topic": {
//           "_id": "5f684d0171adec4d1cf3f4b7",
//           "name": "string"
//         },
//         "unit": {
//           "_id": "5f684d0171adec4d1cf3f4b7",
//           "name": "string"
//         },
//         "tags": [
//           "string"
//         ],
//         "complexity": "easy",
//         "questionType": "single",
//         "isAllowReuse": "global",
//         "moderation": {
//           "moderatedBy": "5f684d0171adec4d1cf3f4b7",
//           "moderationDate": new Date('1990-05-15T12:00:00Z')
//         },
//         "category": "mcq",
//         "questionText": "string",
//         "questionTextArray": [
//           "string"
//         ],
//         "audioFiles": [
//           {
//             "url": "string",
//             "name": "string",
//             "duration": 0
//           }
//         ],
//         "answerExplainArr": [
//           "string"
//         ],
//         "answerExplain": "string",
//         "answerExplainAudioFiles": [
//           {
//             "url": "string",
//             "name": "string",
//             "duration": 0
//           }
//         ],
//         "prefferedLanguage": [
//           "string"
//         ],
//         "questionHeader": "string",
//         "answerNumber": 0,
//         "minusMark": 0,
//         "plusMark": 0,
//         "createdAt": new Date('1990-05-15T12:00:00Z'),
//         "updatedAt": new Date('1990-05-15T12:00:00Z'),
//         "isActive": true,
//         "wordLimit": 0,
//         "partialMark": true,
//         "domain": "string",
//         "facet": 0,
//         "answers": [
//           {
//             "answerText": "string",
//             "answerTextArray": [
//               "string"
//             ],
//             "isCorrectAnswer": true,
//             "input": "string",
//             "marks": 0,
//             "score": 0,
//             "userText": "string",
//             "correctMatch": "string",
//             "audioFiles": [
//               {
//                 "url": "string",
//                 "name": "string",
//                 "duration": 0
//               }
//             ]
//           }
//         ],
//         "userInputDescription": "string",
//         "hasUserInput": true,
//         "argumentDescription": "string",
//         "hasArg": true,
//         "modelId": 0,
//         "tComplexity": 0,
//         "testcases": [
//           {
//             "isSample": true,
//             "args": "string",
//             "input": "string",
//             "output": "string"
//           }
//         ],
//         "coding": [
//           {
//             "language": "string",
//             "timeLimit": 0,
//             "memLimit": 0,
//             "template": "string",
//             "solution": "string"
//           }
//         ],
//         "approveStatus": "string",
//         "alternativeExplanations": [
//           {
//             "user": {
//               "_id": "65f0234192fc57ebc6020dcd",
//               "name": "string"
//             },
//             "explanation": "string",
//             "isApproved": true
//           }
//         ],
//         "lastModifiedBy": "5f684d0171adec4d1cf3f4b7",
//         "uid": "5f684d0171adec4d1cf3f4b7",
//         "locations": ["5f684d0171adec4d1cf3f4b7"],
//         "section": "string",
//         "order": 0,
//         "canEdit": false
//       },
//       {
//         "_id": "65f023bb45934d80a51f4f4f",
//         "user": "5f684d0171adec4d1cf3f4b7",
//         "userRole": "student",
//         "practiceSets": [
//           "65f023bb45934d80a51f4f4d"
//         ],
//         "subject": {
//           "_id": "5f684d0171adec4d1cf3f4b7",
//           "name": "Mathematics"
//         },
//         "topic": {
//           "_id": "5f684d0171adec4d1cf3f4b7",
//           "name": "string"
//         },
//         "unit": {
//           "_id": "5f684d0171adec4d1cf3f4b7",
//           "name": "string"
//         },
//         "tags": [
//           "string"
//         ],
//         "complexity": "easy",
//         "questionType": "single",
//         "isAllowReuse": "global",
//         "moderation": {
//           "moderatedBy": "5f684d0171adec4d1cf3f4b7",
//           "moderationDate": new Date('1990-05-15T12:00:00Z')
//         },
//         "category": "mcq",
//         "questionText": "string",
//         "questionTextArray": [
//           "string"
//         ],
//         "audioFiles": [
//           {
//             "url": "string",
//             "name": "string",
//             "duration": 0
//           }
//         ],
//         "answerExplainArr": [
//           "string"
//         ],
//         "answerExplain": "string",
//         "answerExplainAudioFiles": [
//           {
//             "url": "string",
//             "name": "string",
//             "duration": 0
//           }
//         ],
//         "prefferedLanguage": [
//           "string"
//         ],
//         "questionHeader": "string",
//         "answerNumber": 0,
//         "minusMark": 0,
//         "plusMark": 0,
//         "createdAt": new Date('1990-05-15T12:00:00Z'),
//         "updatedAt": new Date('1990-05-15T12:00:00Z'),
//         "isActive": true,
//         "wordLimit": 0,
//         "partialMark": true,
//         "domain": "string",
//         "facet": 0,
//         "answers": [
//           {
//             "answerText": "string",
//             "answerTextArray": [
//               "string"
//             ],
//             "isCorrectAnswer": true,
//             "input": "string",
//             "marks": 0,
//             "score": 0,
//             "userText": "string",
//             "correctMatch": "string",
//             "audioFiles": [
//               {
//                 "url": "string",
//                 "name": "string",
//                 "duration": 0
//               }
//             ]
//           }
//         ],
//         "userInputDescription": "string",
//         "hasUserInput": true,
//         "argumentDescription": "string",
//         "hasArg": true,
//         "modelId": 0,
//         "tComplexity": 0,
//         "testcases": [
//           {
//             "isSample": true,
//             "args": "string",
//             "input": "string",
//             "output": "string"
//           }
//         ],
//         "coding": [
//           {
//             "language": "string",
//             "timeLimit": 0,
//             "memLimit": 0,
//             "template": "string",
//             "solution": "string"
//           }
//         ],
//         "approveStatus": "string",
//         "alternativeExplanations": [
//           {
//             "user": {
//               "_id": "65f023bb45934d80a51f4f4e",
//               "name": "string"
//             },
//             "explanation": "string",
//             "isApproved": true
//           }
//         ],
//         "lastModifiedBy": "5f684d0171adec4d1cf3f4b7",
//         "uid": "5f684d0171adec4d1cf3f4b7",
//         "locations": ["5f684d0171adec4d1cf3f4b7"],
//         "section": "string",
//         "order": 0,
//         "canEdit": false,
//       }
//     ]
//   }
// }


// export const questionUsedCountStub = (): QuestionUsedCountResponse => {
//   return {
//     "response": [
//       {
//         "qId": "65f023bb45934d80a51f4f4f",
//         "totalPracticesetCount": 1,
//         "details": [
//           {
//             "subjectName": "string",
//             "testId": "65f96546e87ab99918cfdaf0",
//             "testName": "Test123"
//           }
//         ]
//       },
//       {
//         "qId": "65f0234192fc57ebc6020dce",
//         "totalPracticesetCount": 1,
//         "details": [
//           {
//             "subjectName": "string",
//             "testId": "65f96546e87ab99918cfdaf0",
//             "testName": "Test123"
//           }
//         ]
//       },
//       {
//         "qId": "65f02270e5eddd484abb8eeb",
//         "totalPracticesetCount": 6,
//         "details": [
//           {
//             "subjectName": "string",
//             "testId": "65f17fcf74aa1139bc14acd0",
//             "testName": "Test123"
//           },
//           {
//             "subjectName": "string",
//             "testId": "65f18672681167a2dc81aca8",
//             "testName": "Test123"
//           },
//           {
//             "subjectName": "string",
//             "testId": "65f1870bd31e996c75ddedc7",
//             "testName": "Test123"
//           },
//           {
//             "subjectName": "string",
//             "testId": "65f187e9b7a4760c2cde9923",
//             "testName": "Test123"
//           },
//           {
//             "subjectName": "string",
//             "testId": "65f1886ef9892caff315df96",
//             "testName": "Test123"
//           },
//           {
//             "subjectName": "string",
//             "testId": "65f1888d1b59fcb78446102a",
//             "testName": "Test123"
//           }
//         ]
//       },
//       {
//         "qId": "65fbf97a56e6c20970430629",
//         "totalPracticesetCount": 1,
//         "details": [
//           {
//             "subjectName": "string",
//             "testId": "65f96546e87ab99918cfdaf0",
//             "testName": "Test123"
//           }
//         ]
//       }
//     ]
//   }
// }