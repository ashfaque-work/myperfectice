import {
  AddEventsReq,
  AddEventsRes,
  AddExperienceReq,
  AddExperienceRes,
  AddLocationReq,
  AddLocationRes,
  AddStudentInClassroomReq,
  AddStudentInClassroomRes,
  AddSubjectsReq,
  AddSubjectsRes,
  AddUtmVisitorReq,
  AddUtmVisitorRes,
  BlockuserReq,
  BlockuserRes,
  ChangeNewPasswordReq,
  ChangeNewPasswordRes,
  ChangePasswordReq,
  ChangePasswordRes,
  CloseUserAccountReq,
  CloseUserAccountRes,
  ConfirmEmailReq,
  ConfirmEmailRes,
  ConfirmPasswordResetTokenRequest,
  ConfirmPasswordResetTokenResponse,
  CountTotalUsersReq,
  CountTotalUsersRes,
  CreateUserDto,
  CreateUserResponse,
  DeleteEventReq,
  DeleteEventRes,
  DossierStatusUpdateReqDto,
  DossierStatusUpdateResDto,
  EditLocationReq,
  EditLocationRes,
  EducoinsReq,
  EducoinsRes,
  EmployabilityIndexReq,
  EmployabilityIndexRes,
  ExportLevelReportRes,
  ExportUsersReq,
  ExportUsersRes,
  FindOnlineUsersRequest,
  FindOnlineUsersResponse,
  GetCertificationReq,
  GetCertificationRes,
  GetEventsRequest,
  GetEventsResponse,
  GetLiveBoardClassroomsReq,
  GetLiveBoardClassroomsRes,
  GetMeReq,
  GetMeRes,
  GetNewRollNumberRes,
  GetPracticeSummaryReq,
  GetPracticeSummaryRes,
  GetStudentEventsRequest,
  GetStudentEventsResponse,
  GetSuperCoinsActivitiesReq,
  GetSuperCoinsActivitiesRes,
  GetTotalCoinsReq,
  GetTotalCoinsRes,
  GetTurnAuthReq,
  GetTurnAuthRes,
  GetTurnConfigReq,
  GetTurnConfigRes,
  GetUpdateLocationStatusReq,
  GetUpdateLocationStatusRes,
  GetUserLevelInfoReq,
  GetUserLevelInfoRes,
  GetUserPublicProfileReq,
  GetUserPublicProfileRes,
  GetUserRequest,
  GetUserResponse,
  GetUserSuperCoinActivitiesReq,
  GetUserSuperCoinActivitiesRes,
  InviteUsersReq,
  InviteUsersRes,
  JoinOneOnOneWbSessionRequest,
  JoinOneOnOneWbSessionResponse,
  LinkPreviewReq,
  LinkPreviewRes,
  LoginAfterOauthReq,
  LoginAfterOauthRes,
  LoginReqDto,
  LoginResDto,
  ManageSessionReq,
  ManageSessionRes,
  PartnerUserReq,
  PartnerUserRes,
  PsychoIndexReq,
  PsychoIndexRes,
  RecoverPasswordReq,
  RecoverPasswordRes,
  RedeemCoinsReq,
  RedeemCoinsRes,
  RemoveAdditionalInfoReq,
  RemoveAdditionalInfoRes,
  ReportUserReq,
  ReportUserRes,
  RequestEmailCodeReq,
  RequestEmailCodeRes,
  ReqUser,
  ResetPasswordReq,
  ResetPasswordRes,
  SendForReviewDossierReq,
  SendForReviewDossierRes,
  SocialLoginReq,
  SocialLoginRes,
  StartOneOnOneWbSessionRequest,
  StartOneOnOneWbSessionResponse,
  TempConfirmationCodeReq,
  TempConfirmationCodeRes,
  TempSignupReq,
  TempSignupRes,
  UnblockUserReq,
  UnblockUserRes,
  UnsubscribeReq,
  UnsubscribeRes,
  UpdateAdditionalDataRequest,
  UpdateAdditionalDataResponse,
  UpdateAmbassadorReq,
  UpdateAmbassadorRes,
  UpdateConnectionInfoReq,
  UpdateConnectionInfoRes,
  UpdateDossierCommentsReqDto,
  UpdateDossierCommentsResDto,
  UpdateEventReq,
  UpdateEventRes,
  UpdateExperienceReq,
  UpdateExperienceRes,
  UpdateIdentityImageReq,
  UpdateIdentityImageRes,
  UpdateMentorPreferencesReq,
  UpdateMentorPreferencesRes,
  UpdateOptionsDataRequest,
  UpdateOptionsDataResponse,
  UpdateRoleRequest,
  UpdateRoleResponse,
  UpdateRequest,
  UpdateResponse,
  UpdateSubjectsReq,
  UpdateSubjectsRes,
  UpdateTempUserRequest,
  UpdateTempUserResponse,
  UpdateUserCountryReq,
  UpdateUserCountryRes,
  UpdateUserDto,
  UpdateUserResponse,
  UpdateUserStatusReq,
  UpdateUserStatusRes,
  UpdateUtmStatusReq,
  UpdateUtmStatusRes,
  UserLiveBoardRequest,
  UserLiveBoardResponse,
  UserRecentActivityReq,
  UserRecentActivityRes,
  ValidateUserPictureRequest,
  ValidateUserPictureResponse,
  VerifiedCodeReq,
  VerifiedCodeRes,
  VoiceServiceRequest,
  VoiceServiceResponse,
  RefreshTokenReq,
  FindRequest,
} from '@app/common/dto';
import { Inject, Injectable } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';

export const AUTH_SERVICE_NAME = 'AuthGrpcService';
export const AUTH_PACKAGE_NAME = 'auth';
export interface AuthGrpcInterface {
  CreateUser(request: CreateUserDto): Observable<CreateUserResponse>;
  GetUser(request: GetUserRequest): Observable<GetUserResponse>;
  Login(request: LoginReqDto): Promise<LoginResDto>;
  ConfirmEmail(request: ConfirmEmailReq): Promise<ConfirmEmailRes>
  RecoverPassword(request: RecoverPasswordReq): Promise<RecoverPasswordRes>
  ResetPassword(request: ResetPasswordReq): Promise<ResetPasswordRes>
  ConfirmPasswordResetToken(request: ConfirmPasswordResetTokenRequest): Promise<ConfirmPasswordResetTokenResponse>
  VoiceService(request: VoiceServiceRequest): Promise<VoiceServiceResponse>
  ExportUsers(request: ExportUsersReq): Promise<ExportUsersRes>
  ExportLevelReport(request: {}): Promise<ExportLevelReportRes>
  GetCertification(request: GetCertificationReq): Promise<GetCertificationRes>
  GetUserPublicProfile(request: GetUserPublicProfileReq): Promise<GetUserPublicProfileRes>
  GetNewRollNumber(request: {}): Promise<GetNewRollNumberRes>
  Me(request: GetMeReq): Observable<GetMeRes>
  UpdateLocationStatus(request: GetUpdateLocationStatusReq): Promise<GetUpdateLocationStatusRes>
  RemoveAdditionalInfo(request: RemoveAdditionalInfoReq): Promise<RemoveAdditionalInfoRes>
  LinkPreview(request: LinkPreviewReq): Promise<LinkPreviewRes>
  Unsubscribe(request: UnsubscribeReq): Promise<UnsubscribeRes>
  UpdateAmbassador(request: UpdateAmbassadorReq): Promise<UpdateAmbassadorRes>
  GetPracticeSummary(request: GetPracticeSummaryReq): Promise<GetPracticeSummaryRes>
  UserRecentActivity(request: UserRecentActivityReq): Promise<UserRecentActivityRes>
  AddExperience(request: AddExperienceReq): Promise<AddExperienceRes>
  UpdateExperience(request: UpdateExperienceReq): Promise<UpdateExperienceRes>
  UpdateMentorPreferences(request: UpdateMentorPreferencesReq): Promise<UpdateMentorPreferencesRes>
  AddEvents(request: AddEventsReq): Promise<AddEventsRes>
  GetSuperCoinsActivities(request: GetSuperCoinsActivitiesReq): Promise<GetSuperCoinsActivitiesRes>
  GetUserSuperCoinActivities(request: GetUserSuperCoinActivitiesReq): Promise<GetUserSuperCoinActivitiesRes>
  GetTotalCoins(request: GetTotalCoinsReq): Promise<GetTotalCoinsRes>
  RedeemCoins(request: RedeemCoinsReq): Promise<RedeemCoinsRes>
  UpdateEvent(request: UpdateEventReq): Promise<UpdateEventRes>
  DeleteEvent(request: DeleteEventReq): Promise<DeleteEventRes>
  AwardEducoins(request: EducoinsReq): Promise<EducoinsRes>
  DeductEducoins(request: EducoinsReq): Promise<EducoinsRes>
  CountTotalUsers(request: CountTotalUsersReq): Promise<CountTotalUsersRes>
  CloseUserAccount(request: CloseUserAccountReq): Promise<CloseUserAccountRes>
  GetUserLevelInfo(request: GetUserLevelInfoReq): Promise<GetUserLevelInfoRes>
  UpdateUser(request: UpdateUserDto): Observable<UpdateUserResponse>
  UpdateUserCountry(request: UpdateUserCountryReq): Promise<UpdateUserCountryRes>
  DossierStatusUpdate(request: DossierStatusUpdateReqDto): Promise<DossierStatusUpdateResDto>
  UpdateDossierComments(request: UpdateDossierCommentsReqDto): Promise<UpdateDossierCommentsResDto>
  UpdateUserStatus(request: UpdateUserStatusReq): Promise<UpdateUserStatusRes>
  SendForReviewDossier(request: SendForReviewDossierReq): Promise<SendForReviewDossierRes>
  Blockuser(request: BlockuserReq): Promise<BlockuserRes>
  AddLocation(request: AddLocationReq): Promise<AddLocationRes>
  EditLocation(request: EditLocationReq): Promise<EditLocationRes>
  AddSubjects(request: AddSubjectsReq): Promise<AddSubjectsRes>
  ChangePassword(request: ChangePasswordReq): Promise<ChangePasswordRes>
  ChangeNewPassword(request: ChangeNewPasswordReq): Promise<ChangeNewPasswordRes>
  GetLiveBoardClassrooms(request: GetLiveBoardClassroomsReq): Promise<GetLiveBoardClassroomsRes>
  GetTurnAuth(request: GetTurnAuthReq): Promise<GetTurnAuthRes>
  GetTurnConfig(request: GetTurnConfigReq): Promise<GetTurnConfigRes>
  RequestEmailCode(request: RequestEmailCodeReq): Promise<RequestEmailCodeRes>
  UnblockUser(request: UnblockUserReq): Promise<UnblockUserRes>
  ReportUser(request: ReportUserReq): Promise<ReportUserRes>
  PartnerUser(request: PartnerUserReq): Promise<PartnerUserRes>
  UpdateUtmStatus(request: UpdateUtmStatusReq): Promise<UpdateUtmStatusRes>
  AddUtmVisitor(request: AddUtmVisitorReq): Promise<AddUtmVisitorRes>
  ManageSession(request: ManageSessionReq): Promise<ManageSessionRes>
  InviteUsers(request: InviteUsersReq): Promise<InviteUsersRes>
  UpdateSubjects(request: UpdateSubjectsReq): Promise<UpdateSubjectsRes>
  AddStudentInClassroom(request: AddStudentInClassroomReq): Promise<AddStudentInClassroomRes>
  EmployabilityIndex(request: EmployabilityIndexReq): Promise<EmployabilityIndexRes>
  PsychoIndex(request: PsychoIndexReq): Promise<PsychoIndexRes>
  LoginAfterOauth(request: LoginAfterOauthReq): Promise<LoginAfterOauthRes>
  SocialLogin(request: SocialLoginReq): Promise<SocialLoginRes>
  VerifiedCode(request: VerifiedCodeReq): Promise<VerifiedCodeRes>
  TempConfirmationCode(request: TempConfirmationCodeReq): Promise<TempConfirmationCodeRes>
  TempSignup(request: TempSignupReq): Promise<TempSignupRes>
  UpdateIdentityImage(request: UpdateIdentityImageReq): Promise<UpdateIdentityImageRes>
  UpdateConnectionInfo(request: UpdateConnectionInfoReq): Promise<UpdateConnectionInfoRes>
  GetEvents(request: GetEventsRequest): Promise<GetEventsResponse>
  GetStudentEvents(request: GetStudentEventsRequest): Promise<GetStudentEventsResponse>
  FindOnlineUsers(request: FindOnlineUsersRequest): Promise<FindOnlineUsersResponse>
  StartOneOnOneWbSession(request: StartOneOnOneWbSessionRequest): Promise<StartOneOnOneWbSessionResponse>
  JoinOneOnOneWbSession(request: JoinOneOnOneWbSessionRequest): Promise<JoinOneOnOneWbSessionResponse>
  UpdateOptionsData(request: UpdateOptionsDataRequest): Promise<UpdateOptionsDataResponse>
  UpdateRole(request: UpdateRoleRequest): Promise<UpdateRoleResponse>
  UpdateTempUser(request: UpdateTempUserRequest): Promise<UpdateTempUserResponse>
  UpdateAdditionalData(request: UpdateAdditionalDataRequest): Promise<UpdateAdditionalDataResponse>
  UserLiveBoard(request: UserLiveBoardRequest): Promise<UserLiveBoardResponse>
  UpdateTest(request: UpdateRequest): Promise<UpdateResponse>
  ValidateUserPicture(request: ValidateUserPictureRequest): Promise<ValidateUserPictureResponse>
  RefreshToken(request: RefreshTokenReq): Promise<any>
  Find(request: FindRequest): Promise<any>
}
@Injectable()
export class AuthGrpcService {
  private authGrpcService: AuthGrpcInterface;
  constructor(@Inject('authGrpcService') private authGrpcClient: ClientGrpc) { }

  async onModuleInit() {
    this.authGrpcService =
      await this.authGrpcClient.getService<AuthGrpcInterface>(
        AUTH_SERVICE_NAME,
      );
  }
  async CreateUser(request: CreateUserDto) {
    return await this.authGrpcService.CreateUser(request);
  }
  async UpdateUser(request: UpdateUserDto) {
    return await this.authGrpcService.UpdateUser(request);
  }

  async GetUser(request: GetUserRequest): Promise<GetUserResponse> {
    return new Promise((resolve, reject) => {
      this.authGrpcService.GetUser(request).subscribe({
        next: (result: GetUserResponse) => {
          resolve(result);
        },
        error: (error: any) => {
          reject(error);
        }
      });
    });
  }

  async login(request: LoginReqDto): Promise<LoginResDto> {
    return await this.authGrpcService.Login(request);
  }

  async ConfirmEmail(request: ConfirmEmailReq): Promise<ConfirmEmailRes> {
    return await this.authGrpcService.ConfirmEmail(request);
  }

  async RecoverPassword(request: RecoverPasswordReq): Promise<RecoverPasswordRes> {
    return await this.authGrpcService.RecoverPassword(request);
  }

  async ResetPassword(request: ResetPasswordReq): Promise<ResetPasswordRes> {
    return await this.authGrpcService.ResetPassword(request);
  }

  async ConfirmPasswordResetToken(request: ConfirmPasswordResetTokenRequest): Promise<ConfirmPasswordResetTokenResponse> {
    return await this.authGrpcService.ConfirmPasswordResetToken(request);
  }

  async VoiceService(request: VoiceServiceRequest): Promise<VoiceServiceResponse> {
    return await this.authGrpcService.VoiceService(request);
  }

  async ExportUsers(request: ExportUsersReq): Promise<ExportUsersRes> {
    return await this.authGrpcService.ExportUsers(request);
  }

  async ExportLevelReport(request: {}): Promise<ExportLevelReportRes> {
    return await this.authGrpcService.ExportLevelReport({});
  }

  async GetCertification(request: GetCertificationReq): Promise<GetCertificationRes> {
    return await this.authGrpcService.GetCertification(request);
  }

  async GetUserPublicProfile(request: GetUserPublicProfileReq): Promise<GetUserPublicProfileRes> {
    return await this.authGrpcService.GetUserPublicProfile(request);
  }

  async GetNewRollNumber(request: {}): Promise<GetNewRollNumberRes> {
    return await this.authGrpcService.GetNewRollNumber(request);
  }

  async Me(request: GetMeReq): Promise<ReqUser> {
    return new Promise((resolve, reject) => {
      this.authGrpcService.Me(request).subscribe({
        next: (result: GetMeRes) => {
          resolve(result.response);
        },
        error: (error: any) => {
          reject(error);
        }
      });
    });
  }

  async UpdateLocationStatus(request: GetUpdateLocationStatusReq): Promise<GetUpdateLocationStatusRes> {
    return await this.authGrpcService.UpdateLocationStatus(request);
  }

  async RemoveAdditionalInfo(request: RemoveAdditionalInfoReq): Promise<RemoveAdditionalInfoRes> {
    return await this.authGrpcService.RemoveAdditionalInfo(request);

  }

  async LinkPreview(request: LinkPreviewReq): Promise<LinkPreviewRes> {
    return await this.authGrpcService.LinkPreview(request);
  }

  async Unsubscribe(request: UnsubscribeReq): Promise<UnsubscribeRes> {
    return await this.authGrpcService.Unsubscribe(request);
  }

  async UpdateAmbassador(request: UpdateAmbassadorReq): Promise<UpdateAmbassadorRes> {
    return await this.authGrpcService.UpdateAmbassador(request);
  }

  async GetPracticeSummary(request: GetPracticeSummaryReq): Promise<GetPracticeSummaryRes> {
    return await this.authGrpcService.GetPracticeSummary(request);
  }

  async UserRecentActivity(request: UserRecentActivityReq): Promise<UserRecentActivityRes> {
    return await this.authGrpcService.UserRecentActivity(request);
  }

  async AddExperience(request: AddExperienceReq): Promise<AddExperienceRes> {
    return await this.authGrpcService.AddExperience(request);
  }

  async UpdateExperience(request: UpdateExperienceReq): Promise<UpdateExperienceRes> {
    return await this.authGrpcService.UpdateExperience(request);
  }

  async UpdateMentorPreferences(request: UpdateMentorPreferencesReq): Promise<UpdateMentorPreferencesRes> {
    return await this.authGrpcService.UpdateMentorPreferences(request);
  }

  async AddEvents(request: AddEventsReq): Promise<AddEventsRes> {
    return await this.authGrpcService.AddEvents(request);
  }

  async GetSuperCoinsActivities(request: GetSuperCoinsActivitiesReq): Promise<GetSuperCoinsActivitiesRes> {
    return await this.authGrpcService.GetSuperCoinsActivities(request);
  }

  async GetUserSuperCoinActivities(request: GetUserSuperCoinActivitiesReq): Promise<GetUserSuperCoinActivitiesRes> {
    return await this.authGrpcService.GetUserSuperCoinActivities(request);
  }

  async GetTotalCoins(request: GetTotalCoinsReq): Promise<GetTotalCoinsRes> {
    return await this.authGrpcService.GetTotalCoins(request);
  }

  async RedeemCoins(request: RedeemCoinsReq): Promise<RedeemCoinsRes> {
    return await this.authGrpcService.RedeemCoins(request);
  }

  async UpdateEvent(request: UpdateEventReq): Promise<UpdateEventRes> {
    return await this.authGrpcService.UpdateEvent(request);
  }

  async DeleteEvent(request: DeleteEventReq): Promise<DeleteEventRes> {
    return await this.authGrpcService.DeleteEvent(request);
  }

  async AwardEducoins(request: EducoinsReq): Promise<EducoinsRes> {
    return await this.authGrpcService.AwardEducoins(request);
  }

  async DeductEducoins(request: EducoinsReq): Promise<EducoinsRes> {
    return await this.authGrpcService.DeductEducoins(request);
  }

  async CountTotalUsers(request: CountTotalUsersReq): Promise<CountTotalUsersRes> {
    return await this.authGrpcService.CountTotalUsers(request);
  }

  async CloseUserAccount(request: CloseUserAccountReq): Promise<CloseUserAccountRes> {
    return await this.authGrpcService.CloseUserAccount(request);
  }

  async GetUserLevelInfo(request: GetUserLevelInfoReq): Promise<GetUserLevelInfoRes> {
    return await this.authGrpcService.GetUserLevelInfo(request);
  }

  async UpdateUserCountry(request: UpdateUserCountryReq): Promise<UpdateUserCountryRes> {
    return await this.authGrpcService.UpdateUserCountry(request);
  }

  async DossierStatusUpdate(request: DossierStatusUpdateReqDto): Promise<DossierStatusUpdateResDto> {
    return await this.authGrpcService.DossierStatusUpdate(request);
  }

  async UpdateDossierComments(request: UpdateDossierCommentsReqDto): Promise<UpdateDossierCommentsResDto> {
    return await this.authGrpcService.UpdateDossierComments(request);
  }

  async UpdateUserStatus(request: UpdateUserStatusReq): Promise<UpdateUserStatusRes> {
    return await this.authGrpcService.UpdateUserStatus(request);
  }

  async SendForReviewDossier(request: SendForReviewDossierReq): Promise<SendForReviewDossierRes> {
    return await this.authGrpcService.SendForReviewDossier(request);
  }

  async Blockuser(request: BlockuserReq): Promise<BlockuserRes> {
    return await this.authGrpcService.Blockuser(request);
  }

  async AddLocation(request: AddLocationReq): Promise<AddLocationRes> {
    return await this.authGrpcService.AddLocation(request);
  }

  async EditLocation(request: EditLocationReq): Promise<EditLocationRes> {
    return await this.authGrpcService.EditLocation(request);
  }

  async AddSubjects(request: AddSubjectsReq): Promise<AddSubjectsRes> {
    return await this.authGrpcService.AddSubjects(request);
  }

  async ChangePassword(request: ChangePasswordReq): Promise<ChangePasswordRes> {
    return await this.authGrpcService.ChangePassword(request);
  }

  async ChangeNewPassword(request: ChangeNewPasswordReq): Promise<ChangeNewPasswordRes> {
    return await this.authGrpcService.ChangeNewPassword(request);
  }

  async GetLiveBoardClassrooms(request: GetLiveBoardClassroomsReq): Promise<GetLiveBoardClassroomsRes> {
    return await this.authGrpcService.GetLiveBoardClassrooms(request);
  }

  async GetTurnAuth(request: GetTurnAuthReq): Promise<GetTurnAuthRes> {
    return await this.authGrpcService.GetTurnAuth(request);
  }

  async GetTurnConfig(request: GetTurnConfigReq): Promise<GetTurnConfigRes> {
    return await this.authGrpcService.GetTurnConfig(request);
  }

  async RequestEmailCode(request: RequestEmailCodeReq): Promise<RequestEmailCodeRes> {
    return await this.authGrpcService.RequestEmailCode(request);
  }

  async UnblockUser(request: UnblockUserReq): Promise<UnblockUserRes> {
    return await this.authGrpcService.UnblockUser(request);
  }

  async ReportUser(request: ReportUserReq): Promise<ReportUserRes> {
    return await this.authGrpcService.ReportUser(request);
  }

  async PartnerUser(request: PartnerUserReq): Promise<PartnerUserRes> {
    return await this.authGrpcService.PartnerUser(request);
  }

  async UpdateUtmStatus(request: UpdateUtmStatusReq): Promise<UpdateUtmStatusRes> {
    return await this.authGrpcService.UpdateUtmStatus(request);
  }

  async AddUtmVisitor(request: AddUtmVisitorReq): Promise<AddUtmVisitorRes> {
    return await this.authGrpcService.AddUtmVisitor(request);
  }

  async ManageSession(request: ManageSessionReq): Promise<ManageSessionRes> {
    return await this.authGrpcService.ManageSession(request);
  }

  async InviteUsers(request: InviteUsersReq): Promise<InviteUsersRes> {
    return await this.authGrpcService.InviteUsers(request);
  }

  async UpdateSubjects(request: UpdateSubjectsReq): Promise<UpdateSubjectsRes> {
    return await this.authGrpcService.UpdateSubjects(request);
  }

  async AddStudentInClassroom(request: AddStudentInClassroomReq): Promise<AddStudentInClassroomRes> {
    return await this.authGrpcService.AddStudentInClassroom(request);
  }

  async EmployabilityIndex(request: EmployabilityIndexReq): Promise<EmployabilityIndexRes> {
    return await this.authGrpcService.EmployabilityIndex(request);
  }

  async PsychoIndex(request: PsychoIndexReq): Promise<PsychoIndexRes> {
    return await this.authGrpcService.PsychoIndex(request);
  }

  async LoginAfterOauth(request: LoginAfterOauthReq): Promise<LoginAfterOauthRes> {
    return await this.authGrpcService.LoginAfterOauth(request);
  }

  async SocialLogin(request: SocialLoginReq): Promise<SocialLoginRes> {
    return await this.authGrpcService.SocialLogin(request);
  }

  async VerifiedCode(request: VerifiedCodeReq): Promise<VerifiedCodeRes> {
    return await this.authGrpcService.VerifiedCode(request);
  }

  async TempConfirmationCode(request: TempConfirmationCodeReq): Promise<TempConfirmationCodeRes> {
    return await this.authGrpcService.TempConfirmationCode(request);
  }

  async TempSignup(request: TempSignupReq): Promise<TempSignupRes> {
    return await this.authGrpcService.TempSignup(request)
  }

  async UpdateIdentityImage(request: UpdateIdentityImageReq): Promise<UpdateIdentityImageRes> {
    return await this.authGrpcService.UpdateIdentityImage(request);
  }

  async UpdateConnectionInfo(request: UpdateConnectionInfoReq): Promise<UpdateConnectionInfoRes> {
    return await this.authGrpcService.UpdateConnectionInfo(request);
  }

  async GetEvents(request: GetEventsRequest): Promise<GetEventsResponse> {
    return await this.authGrpcService.GetEvents(request);
  }

  async GetStudentEvents(request: GetStudentEventsRequest): Promise<GetStudentEventsResponse> {
    return await this.authGrpcService.GetStudentEvents(request);
  }

  async FindOnlineUsers(request: FindOnlineUsersRequest): Promise<FindOnlineUsersResponse> {
    return await this.authGrpcService.FindOnlineUsers(request);
  }

  async StartOneOnOneWbSession(request: StartOneOnOneWbSessionRequest): Promise<StartOneOnOneWbSessionResponse> {
    return await this.authGrpcService.StartOneOnOneWbSession(request);
  }

  async JoinOneOnOneWbSession(request: JoinOneOnOneWbSessionRequest): Promise<JoinOneOnOneWbSessionResponse> {
    return await this.authGrpcService.JoinOneOnOneWbSession(request);
  }

  async UpdateOptionsData(request: UpdateOptionsDataRequest): Promise<UpdateOptionsDataResponse> {
    return await this.authGrpcService.UpdateOptionsData(request);
  }

  async UpdateRole(request: UpdateRoleRequest): Promise<UpdateRoleResponse> {
    return await this.authGrpcService.UpdateRole(request);
  }

  async UpdateTempUser(request: UpdateTempUserRequest): Promise<UpdateTempUserResponse> {
    return await this.authGrpcService.UpdateTempUser(request);
  }

  async UpdateAdditionalData(request: UpdateAdditionalDataRequest): Promise<UpdateAdditionalDataResponse> {
    return await this.authGrpcService.UpdateAdditionalData(request);
  }

  async UserLiveBoard(request: UserLiveBoardRequest): Promise<UserLiveBoardResponse> {
    return await this.authGrpcService.UserLiveBoard(request);
  }

  async UpdateTest(request: UpdateRequest): Promise<UpdateResponse> {
    return await this.authGrpcService.UpdateTest(request);
  }

  async ValidateUserPicture(request: ValidateUserPictureRequest): Promise<ValidateUserPictureResponse> {
    return await this.authGrpcService.ValidateUserPicture(request);
  }

  async RefreshToken(request: RefreshTokenReq): Promise<any> {
    return await this.authGrpcService.RefreshToken(request);
  }
  
  async Find(request: FindRequest): Promise<any> {
    return await this.authGrpcService.Find(request);
  }
}
