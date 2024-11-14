// import { GetAssessmentResponse, UpdateAllQuestionSectionRequest, UpdateAllQuestionSectionResponse } from "@app/common/dto/assessment.dto"

// export const assessmentStub = (): GetAssessmentResponse => {
//     return {
//         "response": {
//             "_id": "65f17fcf74aa1139bc14acd0",
//             "user": "65f02270e5eddd484abb8eeb",
//             "lastModifiedBy": "65f02270e5eddd484abb8eeb",
//             "lastModifiedDate": new Date('1990-05-15T12:00:00Z'),
//             "active": true,
//             "userInfo": {
//                 "_id": "65f02270e5eddd484abb8eeb",
//                 "name": "string"
//             },
//             "units": [
//                 {
//                     "_id": "65f02270e5eddd484abb8eeb",
//                     "name": "string"
//                 }
//             ],
//             "subjects": [
//                 {
//                     "_id": "65f02270e5eddd484abb8eeb",
//                     "name": "string"
//                 }
//             ],
//             "level": 0,
//             "testMode": "practice",
//             "accessMode": "public",
//             "countries": [
//                 {
//                     "code": "string",
//                     "name": "string",
//                     "currency": "string",
//                     "price": 0,
//                     "marketPlacePrice": 0,
//                     "discountValue": 0
//                 }
//             ],
//             "title": "Test123",
//             "titleLower": "",
//             "courses": [
//                 "65f02270e5eddd484abb8eeb"
//             ],
//             "testseries": [
//                 "65f02270e5eddd484abb8eeb"
//             ],
//             "tags": [
//                 "65f02270e5eddd484abb8eeb"
//             ],
//             "demographicData": {
//                 "city": false,
//                 "state": false,
//                 "dob": false,
//                 "gender": false,
//                 "rollNumber": false,
//                 "identificationNumber": false,
//                 "passingYear": false,
//                 "coreBranch": false,
//                 "collegeName": false,
//                 "identityVerification": false,
//                 "field1": {
//                     "label": "string",
//                     "value": true
//                 },
//                 "field2": {
//                     "label": "string",
//                     "value": true
//                 }
//             },
//             "description": "",
//             "inviteeEmails": [
//                 "string"
//             ],
//             "inviteePhones": [
//                 "string"
//             ],
//             "classRooms": [
//                 "65f02270e5eddd484abb8eeb"
//             ],
//             "studentEmails": [
//                 "string"
//             ],
//             "instructions": "",
//             "isMarksLevel": true,
//             "enableMarks": true,
//             "randomQuestions": true,
//             "randomizeAnswerOptions": true,
//             "sectionJump": true,
//             "sectionTimeLimit": false,
//             "minusMark": 0,
//             "plusMark": 1,
//             "notes": "",
//             "attemptAllowed": null,
//             "status": "draft",
//             "statusChangedAt": new Date('1990-05-15T12:00:00Z'),
//             "expiresOn": null,
//             "startDate": null,
//             "startTimeAllowance": 0,
//             "requireAttendance": false,
//             "totalJoinedStudent": 0,
//             "createdAt": new Date('1990-05-15T12:00:00Z'),
//             "updatedAt": new Date('1990-05-15T12:00:00Z'),
//             "rating": 0,
//             "totalQuestion": 0,
//             "questionsToDisplay": 0,
//             "isPartnerExam": false,
//             "totalTime": 30,
//             "questionsPerTopic": 0,
//             "totalAttempt": 0,
//             "isShowResult": true,
//             "allowTeacher": true,
//             "locations": [
//                 "65f02270e5eddd484abb8eeb"
//             ],
//             "allowStudent": true,
//             "isShowAttempt": true,
//             "createMode": "",
//             "testCode": "",
//             "dirPath": "",
//             "isAdaptive": false,
//             "adaptiveTest": "65f02270e5eddd484abb8eeb",
//             "randomTestDetails": [
//                 {
//                     "topic": "65f02270e5eddd484abb8eeb",
//                     "questions": 0,
//                     "quesMarks": 0
//                 }
//             ],
//             "showCalculator": false,
//             "showFeedback": true,
//             "peerVisibility": false,
//             "initiator": "teacher",
//             "testType": "standard",
//             "questions": [
//                 {
//                     "question": "65f02270e5eddd484abb8eeb",
//                     "section": "string",
//                     "minusMark": 0,
//                     "plusMark": 0,
//                     "createdAt": new Date('1990-05-15T12:00:00Z'),
//                     "order": 0
//                 }
//             ],
//             "sections": [
//                 {
//                     "name": "false",
//                     "time": 0,
//                     "showCalculator": false,
//                     "optionalQuestions": 0
//                 }
//             ],
//             "enabledCodeLang": [
//                 "string"
//             ],
//             "enableSection": false,
//             "camera": false,
//             "fraudDetect": true,
//             "pinTop": false,
//             "autoEvaluation": true,
//             "fullLength": false,
//             "imageUrl": "string",
//             "offscreenLimit": 0,
//             "buyers": [
//                 {
//                     "item": "65f02270e5eddd484abb8eeb",
//                     "user": "65f02270e5eddd484abb8eeb"
//                 }
//             ],
//             "instructors": [
//                 "65f02270e5eddd484abb8eeb"
//             ],
//             "randomSection": false,
//             "uid": "65f02270e5eddd484abb8eeb",
//             "synced": false,
//             "owner": "65f02270e5eddd484abb8eeb",
//             "origin": "publisher"
//         }
//     }
// }

// // export const updateAllQuestionSectionRequestStub = (): UpdateAllQuestionSectionRequest => {
// //     return {
// //         "_id": "65f1870bd31e996c75ddedc7",
// //         "questionIds": [
// //             "65f02270e5eddd484abb8eeb"
// //         ],
// //         "section": [
// //             "physiology"
// //         ]
// //     }
// // }

// export const updateAllQuestionSectionResponseStub = (): UpdateAllQuestionSectionResponse => {
//     return {
//         "_id": "65f1870bd31e996c75ddedc7"
//       }
// }