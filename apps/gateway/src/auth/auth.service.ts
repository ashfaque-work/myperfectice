import { BadRequestException, Injectable } from '@nestjs/common';
import {
  CreateUserDto,
  LoginReqDto,
  AuthGrpcService,
  GetUserRequest,
  UpdateUserDto,
  UpdateUserCountryReq,
  DossierStatusUpdateReqDto,
  UpdateDossierCommentsReqDto,
  UpdateUserStatusReq,
  SendForReviewDossierReq,
  BlockuserReq,
  AddLocationReq,
  EditLocationReq,
  AddSubjectsReq,
  ChangePasswordReq,
  ChangeNewPasswordReq,
  ConfirmEmailReq,
  RecoverPasswordReq,
  ResetPasswordReq,
  ExportUsersReq,
  GetCertificationReq,
  GetUserPublicProfileReq,
  GetMeReq,
  GetUpdateLocationStatusReq,
  RemoveAdditionalInfoReq,
  LinkPreviewReq,
  GetPracticeSummaryReq,
  UserRecentActivityReq,
  AddExperienceReq,
  UpdateExperienceReq,
  UpdateMentorPreferencesReq,
  AddEventsReq,
  GetSuperCoinsActivitiesReq,
  GetUserSuperCoinActivitiesReq,
  GetTotalCoinsReq,
  RedeemCoinsReq,
  UpdateEventReq,
  DeleteEventReq,
  EducoinsReq,
  CountTotalUsersReq,
  UnsubscribeReq,
  UpdateAmbassadorReq,
  CloseUserAccountReq,
  GetUserLevelInfoReq,
  GetLiveBoardClassroomsReq,
  GetTurnConfigReq,
  GetTurnAuthReq,
  RequestEmailCodeReq,
  ReportUserReq,
  UnblockUserReq,
  PartnerUserReq,
  UpdateUtmStatusReq,
  AddUtmVisitorReq,
  ManageSessionReq,
  InviteUsersReq,
  UpdateSubjectsReq,
  AddStudentInClassroomReq,
  EmployabilityIndexReq,
  SocialLoginReq,
  LoginAfterOauthReq,
  VerifiedCodeReq,
  TempConfirmationCodeReq,
  TempSignupReq,
  PsychoIndexReq,
  UpdateIdentityImageReq,
  UpdateConnectionInfoReq,
  ConfirmPasswordResetTokenRequest,
  VoiceServiceRequest,
  GetEventsRequest,
  GetStudentEventsRequest,
  FindOnlineUsersRequest,
  StartOneOnOneWbSessionRequest,
  JoinOneOnOneWbSessionRequest,
  UpdateOptionsDataRequest,
  UpdateRoleRequest,
  UpdateTempUserRequest,
  UpdateAdditionalDataRequest,
  UserLiveBoardRequest,
  UpdateRequest,
  ValidateUserPictureRequest,
  RefreshTokenReq,
  FindRequest,
} from '@app/common';

@Injectable()
export class AuthGatewayService {
  constructor(private authGrpcService: AuthGrpcService) { }
  
  async createUser(request: CreateUserDto, ip: string, user) {
    let combinedData = {
      ...request,
      ip: ip,
      ...user
    }
    return this.authGrpcService.CreateUser(combinedData);
  }

  async updateUserDetails(request: UpdateUserDto) {
    return this.authGrpcService.UpdateUser(request);
  }

  async getUser(request: GetUserRequest) {
    return this.authGrpcService.GetUser(request);
  }

  async login(request: LoginReqDto) {
    console.log(request)
    return this.authGrpcService.login(request);
  }

  async updateUserCountry(id: string, request: UpdateUserCountryReq) {
    request._id = id
    return this.authGrpcService.UpdateUserCountry(request);
  }

  async dossierStatusUpdate(id: string, request: DossierStatusUpdateReqDto) {
    const combinedData = {
      ...request,
      _id: id
    }
    return this.authGrpcService.DossierStatusUpdate(combinedData);
  }

  async updateDossierComments(id: string, request: UpdateDossierCommentsReqDto) {
    const combinedData = {
      ...request,
      _id: id
    }
    return this.authGrpcService.UpdateDossierComments(combinedData);
  }

  async updateUserStatus(id: string, request: UpdateUserStatusReq) {
    const combinedData = {
      ...request,
      _id: id
    }
    return this.authGrpcService.UpdateUserStatus(combinedData);
  }

  async sendForReviewDossier(id: string, request: SendForReviewDossierReq) {
    const combinedData = {
      ...request,
      _id: id
    }
    return this.authGrpcService.SendForReviewDossier(combinedData);
  }

  async blockuser(request: BlockuserReq) {
    return this.authGrpcService.Blockuser(request);
  }

  async addLocation(request: AddLocationReq) {
    return this.authGrpcService.AddLocation(request);
  }

  async editLocation(id: string, request: EditLocationReq) {
    const combinedData = {
      ...request,
      _id: id
    }
    return this.authGrpcService.EditLocation(combinedData);
  }

  async addSubjects(request: AddSubjectsReq) {
    return this.authGrpcService.AddSubjects(request);
  }

  async changePassword(request: ChangePasswordReq) {
    return this.authGrpcService.ChangePassword(request)
  }

  async changeNewPassword(request: ChangeNewPasswordReq) {
    return this.authGrpcService.ChangeNewPassword(request)
  }

  async confirmEmail(instancekey: string, token: string, request: ConfirmEmailReq) {
    request.instancekey = instancekey;
    request.token = token;
    return this.authGrpcService.ConfirmEmail(request);
  }

  async recoverPassword(request: RecoverPasswordReq) {
    return this.authGrpcService.RecoverPassword(request);
  }

  async resetPassword(request: ResetPasswordReq, token: string) {
    request.token = token;
    return this.authGrpcService.ResetPassword(request);
  }

  async confirmPasswordResetToken(request: ConfirmPasswordResetTokenRequest) {
    return this.authGrpcService.ConfirmPasswordResetToken(request);
  }

  async voiceService(request: VoiceServiceRequest) {
    return this.authGrpcService.VoiceService(request);
  }

  async exportUsers(request: ExportUsersReq) {
    return this.authGrpcService.ExportUsers(request);
  }

  async exportLevelReport(request: {}) {
    return this.authGrpcService.ExportLevelReport(request);
  }

  async getCertification(request: GetCertificationReq) {
    return this.authGrpcService.GetCertification(request);
  }

  async getUserPublicProfile(request: GetUserPublicProfileReq) {
    return this.authGrpcService.GetUserPublicProfile(request);
  }

  async getNewRollNumber(request: {}) {
    return this.authGrpcService.GetNewRollNumber(request);
  }

  async me(request: GetMeReq) {
    return this.authGrpcService.Me(request);
  }

  async updateLocationStatus(request: GetUpdateLocationStatusReq) {
    return this.authGrpcService.UpdateLocationStatus(request);
  }

  async removeAdditionalInfo(request: RemoveAdditionalInfoReq) {
    return this.authGrpcService.RemoveAdditionalInfo(request);
  }

  async linkPreview(request: LinkPreviewReq) {
    return this.authGrpcService.LinkPreview(request);
  }

  async unsubscribe(request: UnsubscribeReq) {
    return this.authGrpcService.Unsubscribe(request);
  }

  async updateAmbassador(request: UpdateAmbassadorReq) {
    return this.authGrpcService.UpdateAmbassador(request);
  }

  async getPracticeSummary(request: GetPracticeSummaryReq) {
    return this.authGrpcService.GetPracticeSummary(request);
  }

  async userRecentActivity(request: UserRecentActivityReq) {
    return this.authGrpcService.UserRecentActivity(request);
  }

  async addExperience(request: AddExperienceReq) {
    return this.authGrpcService.AddExperience(request);
  }

  async updateExperience(request: UpdateExperienceReq) {
    return this.authGrpcService.UpdateExperience(request);
  }

  async updateMentorPreferences(request: UpdateMentorPreferencesReq) {
    return this.authGrpcService.UpdateMentorPreferences(request);
  }

  async addEvents(request: AddEventsReq) {
    return this.authGrpcService.AddEvents(request)
  }

  async getSuperCoinsActivities(request: GetSuperCoinsActivitiesReq) {
    return this.authGrpcService.GetSuperCoinsActivities(request);
  }

  async getUserSuperCoinActivities(request: GetUserSuperCoinActivitiesReq) {
    return this.authGrpcService.GetUserSuperCoinActivities(request);
  }

  async getTotalCoins(request: GetTotalCoinsReq) {
    return this.authGrpcService.GetTotalCoins(request);
  }

  async redeemCoins(request: RedeemCoinsReq) {
    return this.authGrpcService.RedeemCoins(request);
  }

  async updateEvent(request: UpdateEventReq) {
    return this.authGrpcService.UpdateEvent(request);
  }

  async deleteEvent(request: DeleteEventReq) {
    return this.authGrpcService.DeleteEvent(request);
  }

  async awardEducoins(request: EducoinsReq) {
    return this.authGrpcService.AwardEducoins(request);
  }

  async deductEducoins(request: EducoinsReq) {
    return this.authGrpcService.DeductEducoins(request);
  }

  async countTotalUsers(request: CountTotalUsersReq) {
    return this.authGrpcService.CountTotalUsers(request);
  }

  async closeUserAccount(request: CloseUserAccountReq) {
    return this.authGrpcService.CloseUserAccount(request);
  }

  async getUserLevelInfo(request: GetUserLevelInfoReq) {
    return this.authGrpcService.GetUserLevelInfo(request);
  }

  async getLiveBoardClassrooms(request: GetLiveBoardClassroomsReq) {
    return this.authGrpcService.GetLiveBoardClassrooms(request);
  }

  async getTurnAuth(request: GetTurnAuthReq) {
    return this.authGrpcService.GetTurnAuth(request);
  }

  async getTurnConfig(request: GetTurnConfigReq) {
    return this.authGrpcService.GetTurnConfig(request);
  }

  async requestEmailCode(request: RequestEmailCodeReq) {
    return this.authGrpcService.RequestEmailCode(request);
  }

  async unblockUser(request: UnblockUserReq) {
    return this.authGrpcService.UnblockUser(request);
  }

  async reportUser(request: ReportUserReq) {
    return this.authGrpcService.ReportUser(request);
  }

  async partnerUser(request: PartnerUserReq) {
    return this.authGrpcService.PartnerUser(request);
  }

  async updateUtmStatus(request: UpdateUtmStatusReq) {
    return this.authGrpcService.UpdateUtmStatus(request);
  }

  async addUtmVisitor(request: AddUtmVisitorReq) {
    return this.authGrpcService.AddUtmVisitor(request);
  }

  async manageSession(request: ManageSessionReq) {
    return this.authGrpcService.ManageSession(request);
  }

  async inviteUsers(request: InviteUsersReq) {
    return this.authGrpcService.InviteUsers(request);
  }

  async updateSubjects(request: UpdateSubjectsReq) {
    return this.authGrpcService.UpdateSubjects(request);
  }

  async addStudentInClassroom(request: AddStudentInClassroomReq) {
    return this.authGrpcService.AddStudentInClassroom(request);
  }

  async employabilityIndex(request: EmployabilityIndexReq) {
    return this.authGrpcService.EmployabilityIndex(request);
  }

  async psychoIndex(request: PsychoIndexReq) {
    return this.authGrpcService.PsychoIndex(request);
  }

  async loginAfterOauth(request: LoginAfterOauthReq) {
    return this.authGrpcService.LoginAfterOauth(request);
  }

  async socialLogin(request: SocialLoginReq) {
    return this.authGrpcService.SocialLogin(request);
  }

  async verifiedCode(request: VerifiedCodeReq) {
    return this.authGrpcService.VerifiedCode(request);
  }

  async tempConfirmationCode(request: TempConfirmationCodeReq) {
    return this.authGrpcService.TempConfirmationCode(request);
  }

  async tempSignup(request: TempSignupReq) {
    return this.authGrpcService.TempSignup(request)
  }

  async updateIdentityImage(request: UpdateIdentityImageReq) {
    return this.authGrpcService.UpdateIdentityImage(request);
  }

  async updateConnectionInfo(request: UpdateConnectionInfoReq) {
    return this.authGrpcService.UpdateConnectionInfo(request);
  }

  async getEvents(request: GetEventsRequest) {
    return this.authGrpcService.GetEvents(request);
  }

  async getStudentEvents(request: GetStudentEventsRequest) {
    return this.authGrpcService.GetStudentEvents(request);
  }

  async findOnlineUsers(request: FindOnlineUsersRequest) {
    return this.authGrpcService.FindOnlineUsers(request);
  }

  async startOneOnOneWbSession(request: StartOneOnOneWbSessionRequest) {
    return this.authGrpcService.StartOneOnOneWbSession(request);
  }

  async joinOneOnOneWbSession(request: JoinOneOnOneWbSessionRequest) {
    return this.authGrpcService.JoinOneOnOneWbSession(request);
  }

  async updateOptionsData(request: UpdateOptionsDataRequest) {
    return this.authGrpcService.UpdateOptionsData(request);
  }

  async updateRole(request: UpdateRoleRequest) {
    return this.authGrpcService.UpdateRole(request);
  }

  async updateTempUser(request: UpdateTempUserRequest) {
    return this.authGrpcService.UpdateTempUser(request);
  }

  async updateAdditionalData(request: UpdateAdditionalDataRequest) {
    const body = request.body.toUpdateData;
    if (!body) {
      throw new BadRequestException();
    }
    switch (request.body.updatedField) {
      case 'educationDetails':
        if (!body.educationType) throw new BadRequestException('Education Type is required');
        if (!body.board) throw new BadRequestException('Board is required');
        if (!body.marksType) throw new BadRequestException('Marks Type is required');
        if (!body.marks) throw new BadRequestException('Marks is required');
        if (!body.passingYear) throw new BadRequestException('Passing year is required');

        break;
      case 'awardsAndRecognition':
        if (!body.awardDetails) throw new BadRequestException('Award Detail is required');
        if (!body.date) throw new BadRequestException('Date is required');

        break;
      case 'extraCurricularActivities':
        if (!body.activityDetails) throw new BadRequestException('Activity Detail is required');
        if (!body.startDate) throw new BadRequestException('Start Date is required');
        if (!body.endDate) throw new BadRequestException('End Date is required');

        break;
      case 'entranceExam':
        if (!body.name) throw new BadRequestException('Entrance exam is required');
        if (!body.rank) throw new BadRequestException('Rank is required');
        if (!body.year) throw new BadRequestException('Year is required');

        break;
      case 'externalAssessment':
        if (!body.name) throw new BadRequestException('Assessment type is required');
        if (!body.mostRecentScore) throw new BadRequestException('Score type is required');
        if (!body.maximumScore) throw new BadRequestException('Maximum score type is required');
        if (!body.yearOfAssessment) throw new BadRequestException('Marks Type is required');

        break;
      case 'programmingLang':
        if (!body.name) throw new BadRequestException('Language is required');
        if (!body.rating) throw new BadRequestException('Rating is required');

        break;

      case 'industryCertificates':
        if (!body.name) throw new BadRequestException('Name is required');
        if (!body.provider) throw new BadRequestException('Provider is required');
        if (!body.certificate) throw new BadRequestException('Certificate is required');
        if (!body.certificateDate) throw new BadRequestException('Certificate Date is required');
        if (!body.url) throw new BadRequestException('Certificate link is required');

        break;
      case 'academicProjects':
        if (!body.name) throw new BadRequestException('Name is required');
        if (!body.groupSize) throw new BadRequestException('Group Size is required');
        if (!body.startDate) throw new BadRequestException('Start Date is required');
        if (!body.endDate) throw new BadRequestException('End Date is required');
        if (!body.document) throw new BadRequestException('Document is required');
        if (!body.url) throw new BadRequestException('Document link is required');

        break;
      case 'trainingCertifications':
        if (!body.type) throw new BadRequestException('Type is required');
        if (!body.provider) throw new BadRequestException('Provider is required');
        if (!body.startDate) throw new BadRequestException('Start Date is required');
        if (!body.endDate) throw new BadRequestException('End Date is required');
        if (!body.certificate) throw new BadRequestException('Certificate is required');
        if (!body.url) throw new BadRequestException('Certificate link is required');
        if (!body.city) throw new BadRequestException('City is required');
        if (!body.state) throw new BadRequestException('State is required');

        break;
      default:
        throw new BadRequestException();
    }
    return this.authGrpcService.UpdateAdditionalData(request);
  }

  async userLiveBoard(request: UserLiveBoardRequest) {
    return this.authGrpcService.UserLiveBoard(request);
  }

  async update(request: UpdateRequest) { 
    return this.authGrpcService.UpdateTest(request);
  }

  async validateUserPicture(request: ValidateUserPictureRequest) {
    return this.authGrpcService.ValidateUserPicture(request);
  }

  async refreshToken(request: RefreshTokenReq) {
    return this.authGrpcService.RefreshToken(request);
  }
  
  async find(request: FindRequest) {
    return this.authGrpcService.Find(request);
  }
}
