import { Body, Controller, UseInterceptors } from '@nestjs/common';
import { UsersService } from './users.service';
import { GrpcMethod } from '@nestjs/microservices';
import { AUTH_SERVICE_NAME } from '@app/common/grpc-clients/auth/auth';
import { AddEventsReq, AddExperienceReq, AddLocationReq, AddStudentInClassroomReq, AddSubjectsReq, AddUtmVisitorReq, BlockuserReq, ChangeNewPasswordReq, ChangePasswordReq, CloseUserAccountReq, CountTotalUsersReq, CreateUserDto, DeleteEventReq, DossierStatusUpdateReqDto, EditLocationReq, EducoinsReq, EmployabilityIndexReq, ExportLevelReportRes, ExportUsersReq, FindOnlineUsersRequest, FindRequest, GetCertificationReq, GetEventsRequest, GetLiveBoardClassroomsReq, GetMeReq, GetPracticeSummaryReq, GetStudentEventsRequest, GetSuperCoinsActivitiesReq, GetTotalCoinsReq, GetTurnAuthReq, GetTurnConfigReq, GetUpdateLocationStatusReq, GetUserLevelInfoReq, GetUserPublicProfileReq, GetUserRequest, GetUserSuperCoinActivitiesReq, InviteUsersReq, JoinOneOnOneWbSessionRequest, LinkPreviewReq, LoginAfterOauthReq, ManageSessionReq, PartnerUserReq, PsychoIndexReq, RedeemCoinsReq, RemoveAdditionalInfoReq, ReportUserReq, RequestEmailCodeReq, SendForReviewDossierReq, SocialLoginReq, StartOneOnOneWbSessionRequest, TempConfirmationCodeReq, TempSignupReq, UnblockUserReq, UnsubscribeReq, UpdateAdditionalDataRequest, UpdateAmbassadorReq, UpdateConnectionInfoReq, UpdateDossierCommentsReqDto, UpdateEventReq, UpdateExperienceReq, UpdateIdentityImageReq, UpdateMentorPreferencesReq, UpdateOptionsDataRequest, UpdateRequest, UpdateRoleRequest, UpdateSubjectsReq, UpdateTempUserRequest, UpdateUserCountryReq, UpdateUserDto, UpdateUserStatusReq, UpdateUtmStatusReq, UserLiveBoardRequest, UserRecentActivityReq, ValidateUserPictureRequest, VerifiedCodeReq } from '@app/common';
import { GrpcToHttpInterceptor } from 'nestjs-grpc-exceptions';

@Controller('users')
@UseInterceptors(GrpcToHttpInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @GrpcMethod(AUTH_SERVICE_NAME, 'CreateUser')
  async createUser(@Body() request: CreateUserDto) {
    return this.usersService.create(request);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'GetUser')
  async getUser(request: GetUserRequest) {
    return this.usersService.getUser(request);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'UpdateUser')
  async updateUser(request: UpdateUserDto) {
    return this.usersService.updateUser(request);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'UpdateUserCountry')
  async updateUserCountry(request: UpdateUserCountryReq) {
    return this.usersService.updateUserCountry(request);
  }
  @GrpcMethod(AUTH_SERVICE_NAME, 'DossierStatusUpdate')
  async dossierStatusUpdate(request: DossierStatusUpdateReqDto) {
    return this.usersService.dossierStatusUpdate(request);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'UpdateDossierComments')
  async updateDossierComments(request: UpdateDossierCommentsReqDto) {
    return this.usersService.updateDossierComments(request);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'UpdateUserStatus')
  async updateUserStatus(request: UpdateUserStatusReq) {
    return this.usersService.updateUserStatus(request);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'SendForReviewDossier')
  async sendForReviewDossier(request: SendForReviewDossierReq) {
    return this.usersService.sendForReviewDossier(request);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'Blockuser')
  async blockuser(request: BlockuserReq) {
    return this.usersService.blockuser(request);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'AddLocation')
  async addLocation(request: AddLocationReq) {
    return this.usersService.addLocation(request);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'EditLocation')
  async editLocation(request: EditLocationReq) {
    return this.usersService.editLocation(request);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'AddSubjects')
  async addSubjects(request: AddSubjectsReq) {
    return this.usersService.addSubjects(request);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'ChangePassword')
  async changePassword(request: ChangePasswordReq) {
    return this.usersService.changePassword(request);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'ChangeNewPassword')
  async changeNewPassword(request: ChangeNewPasswordReq) {
    return this.usersService.changeNewPassword(request);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'ExportUsers')
  async exportUsers(request: ExportUsersReq) {
    return this.usersService.exportUsers(request);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'ExportLevelReport')
  async exportLevelReport(request: {}) {
    return this.usersService.exportLevelReport(request);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'GetCertification')
  async getCertification(request: GetCertificationReq) {
    return this.usersService.getCertification(request);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'GetUserPublicProfile')
  async getPublicUserProfile(request: GetUserPublicProfileReq) {
    return this.usersService.getUserPublicProfile(request);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'GetNewRollNumber')
  async getNewRollNumber(request: {}) {
    return this.usersService.getNewRollNumber(request);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'Me')
  async me(request: GetMeReq) {
    return this.usersService.me(request);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'UpdateLocationStatus')
  async updateLocationStatus(request: GetUpdateLocationStatusReq) {
    return this.usersService.updateLocationStatus(request);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'RemoveAdditionalInfo')
  async removeAdditionalInfo(request: RemoveAdditionalInfoReq) {
    return this.usersService.removeAdditionalInfo(request);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'LinkPreview')
  async linkPreview(request: LinkPreviewReq) {
    return this.usersService.linkPreview(request);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'GetPracticeSummary')
  async getPracticeSummary(request: GetPracticeSummaryReq) {
    return await this.usersService.getPracticeSummary(request);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'UserRecentActivity')
  async userRecentActivity(request: UserRecentActivityReq) {
    return await this.usersService.userRecentActivity(request);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'AddExperience')
  async addExperience(request: AddExperienceReq) {
    return await this.usersService.addExperience(request);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'UpdateExperience')
  async updateExperience(request: UpdateExperienceReq) {
    console.log("from gw service", request);

    return await this.usersService.updateExperience(request);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'UpdateMentorPreferences')
  async updateMentorPreferences(request: UpdateMentorPreferencesReq) {
    return await this.usersService.updateMentorPreferences(request);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'AddEvents')
  async addEvents(request: AddEventsReq) {
    return await this.usersService.addEvents(request);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'GetSuperCoinsActivities')
  async getSuperCoinsActivities(request: GetSuperCoinsActivitiesReq) {
    return await this.usersService.getSuperCoinsActivities(request);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'GetUserSuperCoinActivities')
  async getUserSuperCoinActivities(request: GetUserSuperCoinActivitiesReq) {
    return await this.usersService.getUserSuperCoinActivities(request);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'GetTotalCoins')
  async getTotalCoins(request: GetTotalCoinsReq) {
    return await this.usersService.getTotalCoins(request);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'RedeemCoins')
  async redeemCoins(request: RedeemCoinsReq) {
    return await this.usersService.redeemCoins(request);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'UpdateEvent')
  async updateEvent(request: UpdateEventReq) {
    return await this.usersService.updateEvent(request);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'DeleteEvent')
  async deleteEventReq(request: DeleteEventReq) {
    return await this.usersService.deleteEvent(request);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'AwardEducoins')
  async awardEducoins(request: EducoinsReq) {
    console.log("From controller MS");
    console.log(request.body);
    return await this.usersService.awardEducoins(request);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'DeductEducoins')
  async deductEducoins(request: EducoinsReq) {
    return await this.usersService.deductEducoins(request);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'CountTotalUsers')
  async countTotalUsers(request: CountTotalUsersReq) {
    return await this.usersService.countTotalUsers(request);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'Unsubscribe')
  async unsubscribe(request: UnsubscribeReq) {
    return await this.usersService.unsubscribe(request);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'UpdateAmbassador')
  async updateAmbassador(request: UpdateAmbassadorReq) {
    return await this.usersService.updateAmbassador(request);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'CloseUserAccount')
  async closeUserAccount(request: CloseUserAccountReq) {
    return await this.usersService.closeUserAccount(request);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'GetUserLevelInfo')
  async getUserLevelInfo(request: GetUserLevelInfoReq) {
    return await this.usersService.getUserLevelInfo(request);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'GetLiveBoardClassrooms')
  async getLiveBoardClassrooms(request: GetLiveBoardClassroomsReq) {
    return await this.usersService.getLiveBoardClassrooms(request);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'GetTurnAuth')
  async getTurnAuth(request: GetTurnAuthReq) {
    return await this.usersService.getTurnAuth(request);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'GetTurnConfig')
  async getTurnConfig(request: GetTurnConfigReq) {
    return await this.usersService.getTurnConfig(request);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'RequestEmailCode')
  async requestEmailCode(request: RequestEmailCodeReq) {
    return await this.usersService.requestEmailCode(request);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'UnblockUser')
  async unblockUser(request: UnblockUserReq) {
    return await this.usersService.unblockUser(request);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'ReportUser')
  async reportUser(request: ReportUserReq) {
    return await this.usersService.reportUser(request);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'PartnerUser')
  async partnerUser(request: PartnerUserReq) {
    return await this.usersService.partnerUser(request);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'UpdateUtmStatus')
  async updateUtmStatus(request: UpdateUtmStatusReq) {
    return await this.usersService.updateUtmStatus(request);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'AddUtmVisitor')
  async addUtmVisitor(request: AddUtmVisitorReq) {
    return await this.usersService.addUtmVisitor(request);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'ManageSession')
  async manageSession(request: ManageSessionReq) {
    return await this.usersService.manageSession(request);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'InviteUsers')
  async inviteUsers(request: InviteUsersReq) {
    return await this.usersService.inviteUsers(request);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'UpdateSubjects')
  async updateSubjects(request: UpdateSubjectsReq) {
    return await this.usersService.updateSubjects(request);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'AddStudentInClassroom')
  async addStudentInClassroom(request: AddStudentInClassroomReq) {
    return await this.usersService.addStudentInClassroom(request);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'EmployabilityIndex')
  async employabilityIndex(request: EmployabilityIndexReq) {
    return await this.usersService.employabilityIndex(request);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'PsychoIndex')
  async psychoIndex(request: PsychoIndexReq) {
    return await this.usersService.psychoIndex(request);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'SocialLogin')
  async socialLogin(request: SocialLoginReq) {
    return await this.usersService.socialLogin(request);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'LoginAfterOauth')
  async loginAfterOauth(request: LoginAfterOauthReq) {
    return await this.usersService.loginAfterOauth(request);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'VerifiedCode')
  async verifiedCode(request: VerifiedCodeReq) {
    return await this.usersService.verifiedCode(request);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'TempConfirmationCode')
  async tempConfirmationCode(request: TempConfirmationCodeReq) {
    return await this.usersService.tempConfirmationCode(request);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'TempSignup')
  async tempSignup(request: TempSignupReq) {
    return await this.usersService.tempSignup(request);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'UpdateIdentityImage')
  async updateIdentityImage(request: UpdateIdentityImageReq) {
    return await this.usersService.updateIdentityImage(request);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'UpdateConnectionInfo')
  async updateConnectionInfo(request: UpdateConnectionInfoReq) {
    return await this.usersService.updateConnectionInfo(request);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'GetEvents')
  async getEvents(request: GetEventsRequest) {
    return await this.usersService.getEvents(request);
  }
  
  @GrpcMethod(AUTH_SERVICE_NAME, 'GetStudentEvents')
  async getStudentEvents(request: GetStudentEventsRequest) {
    return await this.usersService.getStudentEvents(request);
  }
  
  @GrpcMethod(AUTH_SERVICE_NAME, 'FindOnlineUsers')
  async findOnlineUsers(request: FindOnlineUsersRequest) {
    return await this.usersService.findOnlineUsers(request);
  }
  
  @GrpcMethod(AUTH_SERVICE_NAME, 'StartOneOnOneWbSession')
  async startOneOnOneWbSession(request: StartOneOnOneWbSessionRequest) {
    return await this.usersService.startOneOnOneWbSession(request);
  }
  
  @GrpcMethod(AUTH_SERVICE_NAME, 'JoinOneOnOneWbSession')
  async joinOneOnOneWbSession(request: JoinOneOnOneWbSessionRequest) {
    return await this.usersService.joinOneOnOneWbSession(request);
  }
  
  @GrpcMethod(AUTH_SERVICE_NAME, 'UpdateOptionsData')
  async updateOptionsData(request: UpdateOptionsDataRequest) {
    return await this.usersService.updateOptionsData(request);
  }
  
  @GrpcMethod(AUTH_SERVICE_NAME, 'UpdateRole')
  async updateRole(request: UpdateRoleRequest) {
    return await this.usersService.updateRole(request);
  }
  
  @GrpcMethod(AUTH_SERVICE_NAME, 'UpdateTempUser')
  async updateTempUser(request: UpdateTempUserRequest) {
    return await this.usersService.updateTempUser(request);
  }
  
  @GrpcMethod(AUTH_SERVICE_NAME, 'UpdateAdditionalData')
  async updateAdditionalData(request: UpdateAdditionalDataRequest) {
    return await this.usersService.updateAdditionalData(request);
  }
  
  @GrpcMethod(AUTH_SERVICE_NAME, 'UserLiveBoard')
  async userLiveBoard(request: UserLiveBoardRequest) {
    return await this.usersService.userLiveBoard(request);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'UpdateTest')
  async update(request: UpdateRequest) {
    return await this.usersService.update(request);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'ValidateUserPicture')
  async validateUserPicture(request: ValidateUserPictureRequest) {
    return await this.usersService.validateUserPicture(request);
  }
  
  @GrpcMethod(AUTH_SERVICE_NAME, 'Find')
  async Find(request: FindRequest) {
    return await this.usersService.find(request);
  }
}
