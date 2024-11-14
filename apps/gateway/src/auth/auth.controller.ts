import { AddEventsReq, AddExperienceReq, AddLocationReq, AddSubjectsReq, AddUtmVisitorReq, BlockuserReq, ChangeNewPasswordBody, ChangeNewPasswordQuery, ChangePasswordBody, CreateUserDto, DossierStatusUpdateReqDto, EditLocationReq, EducoinsReq, ExportUsersReq, FindOnlineUsersQuery, FindQuery, GetEventsQuery, GetStudentEventsQuery, InviteUsersReq, JoinOneOnOneWbSessionQuery, LoginAfterOauthReq, LoginReqDto, ManageSessionBody, ManageSessionReq, ObjectIdPipe, PartnerUserBody, RecoverPasswordReq, RedeemCoinsReq, RemoveAdditionalInfoReq, ReportUserReq, ReqUser, SendForReviewDossierReq, SocialLoginBody, StartOneOnOneWbSessionQuery, TempSignupReq, TotalUserQuery, UnblockUserReq, UnsubscribeReq, UpdateAdditionalDataBody, UpdateAmbassadorReq, UpdateConnectionBody, UpdateDossierCommentsReqDto, UpdateEventReq, UpdateExperienceReq, UpdateIdentityImageBody, UpdateIdentityImageParam, UpdateMentorPreferencesReq, UpdateOptionsDataBody, UpdateRequest, UpdateRoleBody, UpdateSubjectsReq, UpdateTempUserBody, UpdateUserBody, UpdateUserCountryReq, UpdateUserStatusReq, UpdateUtmStatusReq, UserLiveBoardQuery, ValidateUserPictureRequest, VoiceServiceRequest } from '@app/common';
import { Body, Controller, Delete, Get, Headers, Ip, Param, Post, Put, Query, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGatewayService } from './auth.service';
import { ApiTags, ApiHeader, ApiQuery, ApiParam } from '@nestjs/swagger';
import { AuthenticationGuard, RequestAuthenticationGuard, RolesGuard, UserIdConversion } from '@app/common/auth';
import { Roles } from '@app/common/decorators';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthGatewayService) { }

  @ApiQuery({ name: 'accesstoken', required: false, type: String })
  @ApiQuery({ name: 'remember', required: false, type: Boolean })
  @Get('/refreshToken')
  async refreshToken(
    @Query('accesstoken') accesstoken: string, @Query('remember') remember: boolean,
    @Headers('authtoken') authtoken: string, @Headers('instancekey') instancekey: string
  ) {
    return this.authService.refreshToken({ accesstoken, remember, authtoken, instancekey });
  }

  @Get('set-password')
  @ApiHeader({ name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  async resetPassword(@Query('token') token: string, @Body() request) {
    return this.authService.resetPassword(request, token);
  }

  @Get('exportUsers')
  @ApiHeader({ name: 'authtoken' })
  @Roles(['admin', 'support'])
  @UseGuards(AuthenticationGuard, RolesGuard)
  async exportUsers(@Query() query: ExportUsersReq) {
    return this.authService.exportUsers(query);
  }

  @Get('exportLevelReport')
  @ApiHeader({ name: 'authtoken' })
  @Roles(['admin', 'support'])
  @UseGuards(AuthenticationGuard, RolesGuard)
  async exportLevelReport() {
    return this.authService.exportLevelReport({});
  }

  @Get('certification/:code')
  async getCertification(@Param('code') code: string) {
    return this.authService.getCertification({ code });
  }

  @Get('publicProfile/:userId')
  async getUserPublicProfile(@Param('userId') userId: string) {
    return this.authService.getUserPublicProfile({ userId });
  }

  @Get('newRollNumber')
  @ApiHeader({ name: 'authtoken' })
  @Roles(['admin', 'support'])
  @UseGuards(AuthenticationGuard, RolesGuard)
  async getNewRollNumber() {
    return this.authService.getNewRollNumber({});
  }

  @Get('me')
  @ApiHeader({ name: 'authtoken' })
  @ApiHeader({ name: 'instancekey', required: false })
  @UseGuards(AuthenticationGuard)
  async me(@Req() req: any, @Headers('instancekey') instancekey: string) {
    const combinedData = {
      user: req.user,
      isTempt: false,
      instancekey: instancekey
    }
    return this.authService.me(combinedData)
  }

  @Delete('/:id')
  @ApiHeader({ name: 'authtoken' })
  @Roles(['admin', 'support'])
  @UseGuards(AuthenticationGuard, RolesGuard)
  updateLocationStatus(@Param('id') id: string) {
    return this.authService.updateLocationStatus({ _id: id })
  }

  @Post('remove')
  @ApiHeader({ name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  removeAdditionalInfo(@Body() request: RemoveAdditionalInfoReq, @Req() req: any) {
    let combinedData = {
      ...request,
      user: req.user
    }
    return this.authService.removeAdditionalInfo(combinedData);
  }

  @Get('link-preview/:id')
  @ApiQuery({ name: 'url', required: false })
  async linkPreview( @Param('id') id: string, @Query() query) {
    const combinedData = {
      url: query.url,
      _id: id
    }
    return this.authService.linkPreview(combinedData);
  }

  @Put('unsubscribe')
  @ApiHeader({ name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  async unsubscribe(@Body() body: UnsubscribeReq, @Req() req: any) {
    const combinedData = {
      ...body,
      user: req.user
    }
    return this.authService.unsubscribe(combinedData)
  }

  @Put('ambassador')
  @ApiHeader({ name: 'authtoken' })
  @ApiHeader({ name: 'instancekey' })
  @UseGuards(AuthenticationGuard)
  async updateAmbassador(@Body() body: UpdateAmbassadorReq, @Req() req: any) {
    const combinedData = {
      ...body,
      user: req.user,
      instancekey: req.headers['instancekey']
    }
    return this.authService.updateAmbassador(combinedData)
  }

  @Get('analytics/practice-summary/:id')
  @ApiHeader({ name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  async getPracticeSummary(@Param('id') id: string, @Req() req: any) {
    const combinedData = {
      user: req.user,
      _id: id
    }
    return this.authService.getPracticeSummary(combinedData);
  }

  @Get('userRecentActivity/:studentId')
  @ApiHeader({ name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  async userRecentActivity(@Param('studentId') studentId: string) {
    return this.authService.userRecentActivity({ studentId });
  }

  @Put('addExperience/:id')
  @ApiHeader({ name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  async addExperience(@Param('id') id: string, @Body() req: AddExperienceReq) {
    const combinedData = {
      startDate: req.startDate,
      endDate: req.endDate,
      _id: id
    }
    console.log(combinedData);
    return this.authService.addExperience(combinedData);
  }

  @Put('updateExperience/:id')
  @ApiHeader({ name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  async updateExperience(@Param('id') id: string, @Body() req: UpdateExperienceReq) {
    const combinedData = {
      _id: id,
      body: { ...req.body }
    }
    console.log(combinedData);
    return this.authService.updateExperience(combinedData);
  }

  @Put('updateMentorPrefernces/:id')
  @ApiHeader({ name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  async updateMentorPreferences(@Param('id') id: string, @Body() req: UpdateMentorPreferencesReq) {
    const combinedData = {
      _id: id,
      ...req
    }
    return this.authService.updateMentorPreferences(combinedData);
  }

  @Post('addEvents')
  @ApiHeader({ name: 'authtoken' })
  @Roles(['admin', 'director'])
  @UseGuards(AuthenticationGuard, RolesGuard)
  async addEvents(@Req() req: any, @Body() body: AddEventsReq) {
    const combinedData = {
      user: req.user,
      ...body
    }
    console.log(combinedData);
    return this.authService.addEvents(combinedData)
  }

  @Get('getSuperCoinsActivities/:userId')
  @ApiHeader({ name: 'authtoken' })
  @ApiQuery({ name: 'tags', required: false })
  @UseGuards(AuthenticationGuard)
  async getSuperCoinsActivities(@Param('userId') userId: string, @Query('tags') tags?: string) {
    const combinedData = {
      tags,
      userId
    }
    return this.authService.getSuperCoinsActivities(combinedData);
  }

  @Get('getUserSuperCoinActivities/:userId')
  @ApiHeader({ name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  async getUserSuperCoinActivities(@Param('userId') userId: string, @Req() req: any, @Query('startDate') startDate: string, @Query('endDate') endDate: string, @Headers('timezoneoffset') timezoneoffset: string) {
    const combinedData = {
      userId,
      user: req.user,
      startDate,
      endDate,
      timezoneoffset
    }
    return this.authService.getUserSuperCoinActivities(combinedData);
  }

  @Get('getTotalCoins/:userId')
  @ApiHeader({ name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  async getTotalCoins(@Req() req: any, @Param('userId') userId: string) {
    const combinedData = {
      user: req.user,
      userId
    }
    return this.authService.getTotalCoins(combinedData);
  }

  @Post('redeemCoins/:userId')
  @ApiHeader({ name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  async redeemCoins(@Param('userId') userId: string, @Body() body: RedeemCoinsReq, @Req() req: any) {
    const combinedData = {
      userId,
      ...body,
      user: req.user
    }
    return this.authService.redeemCoins(combinedData);
  }

  @Put('updateEvent/:id')
  @ApiHeader({ name: 'authtoken' })
  @Roles(['admin', 'director'])
  @UseGuards(AuthenticationGuard, RolesGuard)
  async updateEvent(@Param('id') id: string, @Body() body: UpdateEventReq, @Req() req: any) {
    const combinedData = {
      id,
      user: req.user,
      ...body
    }
    return this.authService.updateEvent(combinedData);
  }

  @Delete('deleteEvent/:id')
  @ApiHeader({ name: 'authtoken' })
  @Roles(['admin', 'director'])
  @UseGuards(AuthenticationGuard, RolesGuard)
  async deleteEvent(@Req() req: any, @Param('id') id: string) {
    const combinedData = {
      user: req.user,
      id
    }
    return this.authService.deleteEvent(combinedData);
  }

  @Post('awardEducoins')
  @ApiHeader({ name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  async awardEducoins(@Body() body: EducoinsReq, @Req() req: any) {
    const combinedData: any = {
      ...body,
      user: req.user
    }
    return this.authService.awardEducoins(combinedData);
  }

  @Post('deductEducoins')
  @ApiHeader({ name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  async deductEducoins(@Body() body: EducoinsReq, @Req() req: any) {
    const combinedData: any = {
      ...body,
      user: req.user
    }
    return this.authService.deductEducoins(combinedData);
  }

  @Get('totalUsers/:id')
  @ApiHeader({ name: 'authtoken', required: true })
  @Roles(['admin', 'director'])
  @UseGuards(AuthenticationGuard, RolesGuard)
  async countTotalUsers(@Headers('instancekey') instancekey: string, @Query() query: TotalUserQuery, @Req() req: any) {

    return this.authService.countTotalUsers({ instancekey, query, user: req.user });
  }

  @Put('closeAccount')
  @ApiHeader({ name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  async closeUserAccount(@Req() req: any) {
    const combinedData = { user: req.user };
    return this.authService.closeUserAccount(combinedData);
  }

  @Get('getUserLevel/:id')
  @ApiHeader({ name: 'authtoken', required: true })
  @UseGuards(AuthenticationGuard)
  async getUserLevelInfo(@Headers('instancekey') instancekey: string, @Param('id') id: string, @Req() req: any) {
    return this.authService.getUserLevelInfo({ instancekey, id, user: req.user });
  }

  @Get('turnAuth')
  @ApiHeader({ name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  async getTurnAuth(@Req() req: any) {
    const combinedData = {
      user: req.user
    }
    return this.authService.getTurnAuth(combinedData);
  }

  @Get('turnConfig')
  @ApiHeader({ name: 'authtoken' })
  @ApiHeader({ name: 'instancekey' })
  @UseGuards(AuthenticationGuard)
  async getTurnConfig(@Req() req: any) {
    const combinedData = {
      instancekey: req.headers['instancekey'],
      user: req.user
    }
    return this.authService.getTurnConfig(combinedData);
  }

  @Put('/:id/requestEmailCode')
  async requestEmailCode(@Param('id') id: string) {
    return this.authService.requestEmailCode({ id });
  }

  @Post('users')
  @UseInterceptors(UserIdConversion)
  async createUser(@Headers('instancekey') instancekey: string, @Body() request: CreateUserDto, @Ip() ip: string) {
    request = {
      ...request,
      instancekey: instancekey
    }
    return this.authService.createUser(request, ip, {});
  }

  @Post('addUser')
  @ApiHeader({ name: 'authtoken' })
  @ApiHeader({ name: 'instancekey' })
  @UseInterceptors(UserIdConversion)
  @Roles(['admin', 'support', 'director'])
  @UseGuards(AuthenticationGuard, RolesGuard)
  async addUsers(@Body() request: CreateUserDto, @Ip() ip: string, @Req() user: ReqUser) {
    return this.authService.createUser(request, ip, user);
  }

  @Put(':id/password')
  @ApiHeader({ name: 'authtoken', required: true })
  @UseGuards(AuthenticationGuard)
  async changePassword(@Headers('instancekey') instancekey: string, @Headers('timezoneoffset') timezoneoffset: string, @Body() body: ChangePasswordBody, @Req() req: any) {
    return this.authService.changePassword({ instancekey, timezoneoffset, body, user: req.user, token: req.headers['authtoken'] });
  }

  @Put(':id/newPassword')
  async changeNewPassword(@Headers('instancekey') instancekey: string,
    @Headers('timezoneoffset') timezoneoffset: string,
    @Param('id') id: string,
    @Query() query: ChangeNewPasswordQuery,
    @Body() body: ChangeNewPasswordBody,
    @Req() req: any) {
    return this.authService.changeNewPassword(
      {
        instancekey, id, query, body, timezoneoffset, ip: req.ip,
        headers: { userAgent: req.headers['user-agent'] }, token: req.headers['authtoken']
      }
    );
  }

  @Post('login')
  async login(@Headers('instancekey') instancekey: string, @Body() request: LoginReqDto, @Req() req: any) {
    const combinedData = {
      headers: { instancekey: instancekey, userAgent: req.headers['user-agent'] },
      ip: req.ip,
      ...request,
    }
    return this.authService.login(combinedData);
  }

  @Put('updateUser/:id')
  @ApiHeader({ name: 'authtoken', required: true })
  @Roles(['admin', 'support', 'director', 'publisher'])
  @UseGuards(AuthenticationGuard, RolesGuard)
  async updateUserDetails(@Headers('instancekey') instancekey: string, @Headers('timezoneoffset') timezoneoffset: string, @Param('id') id: string, @Body() body: UpdateUserBody, @Req() req: any) {
    return this.authService.updateUserDetails({ instancekey, timezoneoffset, body, _id: id, user: req.user, token: req.headers['authtoken'] });
  }

  @Put(':id/country')
  @ApiHeader({ name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  async updateUserCountry(@Param('id') id: string, @Body() request: UpdateUserCountryReq) {
    return this.authService.updateUserCountry(id, request);
  }

  @Put('dossierStatusUpdate/:id')
  @ApiHeader({ name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  async dossierStatusUpdate(@Param('id') id: string, @Body() request: DossierStatusUpdateReqDto) {
    return this.authService.dossierStatusUpdate(id, request);
  }

  @Put('updateDossierComments/:id')
  @ApiHeader({ name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  async updateDossierComments(@Param('id') id: string, @Body() request: UpdateDossierCommentsReqDto) {
    return this.authService.updateDossierComments(id, request);
  }

  @Put('updateUserStatus/:id')
  @ApiHeader({ name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  async updateUserStatus(@Param('id') id: string, @Body() request: UpdateUserStatusReq) {
    return this.authService.updateUserStatus(id, request);
  }

  @Put('sendForReviewDossier/:id')
  @ApiHeader({ name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  async sendForReviewDossier(@Param('id') id: string, @Body() request: SendForReviewDossierReq) {
    return this.authService.sendForReviewDossier(id, request);
  }

  @Post('blockuser')
  @ApiHeader({ name: 'authtoken' })
  @ApiHeader({ name: 'instancekey' })
  @UseGuards(AuthenticationGuard)
  async blockuser(@Body() request: BlockuserReq) {
    return this.authService.blockuser(request);
  }

  @Post('unblockUser')
  @ApiHeader({ name: 'authtoken' })
  @ApiHeader({ name: 'instancekey' })
  @UseGuards(AuthenticationGuard)
  async unblockUser(@Body() request: UnblockUserReq, @Req() req: any) {
    const combinedData = {
      ...request,
      user: req.user
    }
    return this.authService.unblockUser(combinedData);
  }

  @Post('reportUser')
  @ApiHeader({ name: 'authtoken' })
  @ApiHeader({ name: 'instancekey' })
  @UseGuards(AuthenticationGuard)
  async reportUser(@Body() request: ReportUserReq, @Req() req: any) {
    const combinedData = {
      ...request,
      user: req.user
    }
    return this.authService.reportUser(combinedData);
  }

  @Post('partner/user')
  @ApiHeader({ name: 'x-access-token' })
  @ApiQuery({ name: 'token', required: false })
  @UseGuards(RequestAuthenticationGuard)
  async partnerUser(@Headers('instancekey') instancekey: string, @Query('token') token: string, @Body() body: PartnerUserBody) {
    return this.authService.partnerUser({ instancekey, body });
  }

  @Put('marketingUtm/status')
  @ApiHeader({ name: 'authtoken' })
  @ApiHeader({ name: 'instancekey' })
  @UseGuards(AuthenticationGuard)
  async updateUtmStatus(@Body() request: UpdateUtmStatusReq, @Req() req: any) {
    const combinedData = {
      ...request,
      user: req.user
    }
    return this.authService.updateUtmStatus(combinedData);
  }

  @Post('marketingUtm/visitor')
  @ApiHeader({ name: 'authtoken' })
  @ApiHeader({ name: 'instancekey' })
  @UseGuards(AuthenticationGuard)
  async addUtmVisitor(@Body() request: AddUtmVisitorReq, @Req() req: any) {
    const combinedData = {
      ...request,
      ip: req.ip,
      user: req.user
    }
    return this.authService.addUtmVisitor(combinedData);
  }

  @Post('manageSession')
  @ApiHeader({ name: 'authtoken', required: true })
  @UseGuards(AuthenticationGuard)
  async manageSession(@Headers('instancekey') instancekey: string, @Body() body: ManageSessionBody) {
    return this.authService.manageSession({ instancekey, body });
  }

  @Post('inviteToJoin')
  @ApiHeader({ name: 'authtoken' })
  @ApiHeader({ name: 'instancekey' })
  @UseGuards(AuthenticationGuard)
  async inviteUsers(@Body() request: InviteUsersReq, @Req() req: any) {
    const combinedData = {
      ...request,
      instancekey: req.headers['instancekey'],
      user: req.user
    }
    return this.authService.inviteUsers(combinedData)
  }

  @Put('updateSubjects')
  @ApiHeader({ name: 'authtoken' })
  @ApiHeader({ name: 'instancekey' })
  @UseGuards(AuthenticationGuard)
  async updateSubjects(@Body() request: UpdateSubjectsReq, @Req() req: any) {
    const combinedData = {
      ...request,
      user: req.user,
      instancekey: req.headers['instancekey']
    }
    return this.authService.updateSubjects(combinedData);
  }

  @Get('addUserInClassroom/:seqCode')
  @ApiHeader({ name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  @ApiHeader({ name: 'instancekey' })
  @ApiQuery({ name: 'testCode', required: false })
  @ApiQuery({ name: 'subjects', required: false, description: "Comma separated subject Id" })
  async addStudentInClassroom(@Param('seqCode') seqCode: string, @Req() req: any) {
    const combinedData = {
      params: { seqCode },
      query: req.query,
      user: req.user,
      instancekey: req.headers['instancekey']
    }
    return this.authService.addStudentInClassroom(combinedData);
  }

  @Get('employabilityIndex/:id')
  @ApiHeader({ name: 'authtoken' })
  @ApiHeader({ name: 'instancekey' })
  @UseGuards(AuthenticationGuard)
  async employabilityIndex(@Req() req: any) {
    const combinedData = {
      user: req.user,
      instancekey: req.headers['instancekey']
    }
    return this.authService.employabilityIndex(combinedData);
  }

  @Get('psychoIndex/:id')
  @ApiHeader({ name: 'authtoken' })
  @ApiHeader({ name: 'instancekey' })
  @UseGuards(AuthenticationGuard)
  async psychoIndex(@Req() req: any) {
    const combinedData = {
      user: req.user,
      instancekey: req.headers['instancekey']
    }
    return this.authService.psychoIndex(combinedData);
  }

  @Post('addLocation')
  @ApiHeader({ name: 'authtoken' })
  @Roles(['admin', 'support'])
  @UseGuards(AuthenticationGuard, RolesGuard)
  async addLocation(@Body() request: AddLocationReq) {
    return this.authService.addLocation(request);
  }

  @Put('editLocation/:id')
  @ApiHeader({ name: 'authtoken' })
  @Roles(['admin', 'support'])
  @UseGuards(AuthenticationGuard, RolesGuard)
  async editLocation(@Param('id') id: string, @Body() request: EditLocationReq) {
    return this.authService.editLocation(id, request);
  }

  @Put('addSubjects')
  @ApiHeader({ name: 'authtoken' })
  @Roles(['admin', 'support'])
  @UseGuards(AuthenticationGuard, RolesGuard)
  async addSubjects(@Body() request: AddSubjectsReq) {
    return this.authService.addSubjects(request);
  }

  @Post('recoverPassword')
  async recoverPassword(@Headers('instancekey') instancekey: string, @Body() request: RecoverPasswordReq) {
    request = {
      ...request,
      instancekey: instancekey
    }
    return this.authService.recoverPassword(request);
  }

  @Get('/confirmPasswordResetToken/:token')
  async confirmPasswordResetToken(@Headers('instancekey') instancekey: string, @Param('token') token: string) {
    return this.authService.confirmPasswordResetToken({ instancekey, token });
  }

  @Post('/voice-service')
  async voiceService(@Body() request: VoiceServiceRequest, @Req() req: any) {
    return this.authService.voiceService({ ...request, ip: req.ip, headers: { userAgent: req.headers['user-agent'] } });
  }

  @Get('/confirm-email/:token')
  @ApiHeader({ name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  async confirmEmail(@Param('token') token: string, @Req() request: any) {
    return this.authService.confirmEmail(request.instancekey, token, request.body);
  }

  @Get('live-board/classrooms/:status')
  @ApiHeader({ name: 'authtoken' })
  @ApiHeader({ name: 'timezoneoffset' })
  @ApiQuery({ name: 'keywords', required: false })
  @UseGuards(AuthenticationGuard)
  async getLiveBoardClassrooms(@Param('status') status: string, @Req() req: any, @Query('keywords') keywords: string) {
    const combinedData = {
      status,
      user: req.user,
      timezoneoffset: req.headers.timezoneoffset,
      keywords
    }
    return this.authService.getLiveBoardClassrooms(combinedData);
  }

  @Get('verifyCode/:token')
  @ApiHeader({ name: 'instancekey' })
  async verifiedCode(@Param('token') token: string, @Req() req: any) {
    const combinedData = {
      params: { token },
      instancekey: req.headers['instancekey']
    }
    return this.authService.verifiedCode(combinedData);
  }

  @Post('socialLogin/:provider')
  async socialLogin(@Headers('instancekey') instancekey: string, @Req() req: any, @Param('provider') provider: string, @Body() body: SocialLoginBody) {
    return this.authService.socialLogin({ provider, instancekey, body, ip: req.ip, headers: { userAgent: req.headers['user-agent'] } })
  }

  @Post('loginAfterOauth')
  @ApiHeader({ name: 'instancekey' })
  @ApiQuery({ name: 'remember', required: false })
  async loginAfterOauth(@Body() request: LoginAfterOauthReq, @Req() req: any, @Query('remember') remember: boolean) {
    const combinedData = {
      ...request,
      instaneKey: req.headers['instancekey'],
      headers: { userAgent: req.headers['user-agent'] }
    }
    return this.authService.loginAfterOauth(combinedData);
  }

  @Put('/:id/requestConfirmationCode')
  @ApiHeader({ name: 'instancekey' })
  async tempConfirmationCode(@Param('id') id: string, @Req() req: any) {
    const combinedData = {
      id,
      instancekey: req.headers['instancekey']
    }
    return this.authService.tempConfirmationCode(combinedData);
  }

  @Post('signup')
  @ApiHeader({ name: 'authtoken' })
  @ApiHeader({ name: 'instancekey' })
  @UseGuards(AuthenticationGuard)
  async tempSignup(@Body() request: TempSignupReq, @Req() req: any) {
    const combinedData = {
      ...request,
      instancekey: req.headers['instancekey']
    }
    return this.authService.tempSignup(combinedData);
  }

  @Put('/:id/identityImage')
  @ApiHeader({ name: 'authtoken' })
  @ApiHeader({ name: 'instancekey' })
  @UseGuards(AuthenticationGuard)
  async updateIdentityImage(@Param() params: UpdateIdentityImageParam, @Req() req: any, @Body() request: UpdateIdentityImageBody) {
    console.log(params);
    const combinedData = {
      params,
      body: { ...request },
      instancekey: req.headers['instancekey']
    }
    return this.authService.updateIdentityImage(combinedData)
  }

  @Put('connection/:id')
  @ApiHeader({ name: 'authtoken' })
  @ApiHeader({ name: 'instancekey' })
  @UseGuards(AuthenticationGuard)
  async updateConnectionInfo(@Param('id') id: string, @Req() req: any, @Body() request: UpdateConnectionBody) {
    const combinedData = {
      user: req.user,
      headers: { instancekey: req.headers['instancekey'], userAgent: req.headers['user-agent'], authToken: req.headers['authtoken'] },
      body: { ...request },
      ip: req.ip
    }
    return this.authService.updateConnectionInfo(combinedData);
  }

  @Get('/events')
  @ApiHeader({ name: 'authtoken', required: true })
  @UseGuards(AuthenticationGuard)
  async getEvents(@Headers('instancekey') instancekey: string, @Headers('timezoneoffset') timezoneoffset: string, @Query() query: GetEventsQuery, @Req() req: any) {
    return this.authService.getEvents({ instancekey, user: req.user, query, headers: { timezoneoffset: timezoneoffset } });
  }

  @Get('/studentEvents/:studentId')
  @ApiHeader({ name: 'authtoken', required: true })
  @ApiParam({ name: 'studentId', required: true })
  @Roles(['admin', 'centerHead', 'teacher', 'director', 'support', 'operator'])
  @UseGuards(AuthenticationGuard, RolesGuard)
  async getStudentEvents(@Headers('instancekey') instancekey: string, @Headers('timezoneoffset') timezoneoffset: string, @Param('studentId', ObjectIdPipe) studentId: string, @Query() query: GetStudentEventsQuery, @Req() req: any) {
    return this.authService.getStudentEvents({ instancekey, studentId, user: req.user, query, headers: { timezoneoffset: timezoneoffset } });
  }

  @Get('/onlineUsers')
  @ApiHeader({ name: 'authtoken', required: true })
  @UseGuards(AuthenticationGuard)
  async findOnlineUsers(@Headers('instancekey') instancekey: string, @Query() query: FindOnlineUsersQuery, @Req() req: any) {
    return this.authService.findOnlineUsers({ instancekey, query, token: req.headers['authtoken'] });
  }

  @Get('/startOneOnOneWbSession')
  @ApiHeader({ name: 'authtoken', required: true })
  @Roles(['teacher'])
  @UseGuards(AuthenticationGuard, RolesGuard)
  async startOneOnOneWbSession(@Headers('instancekey') instancekey: string, @Query() query: StartOneOnOneWbSessionQuery, @Req() req: any) {
    return this.authService.startOneOnOneWbSession({ instancekey, query, user: req.user, token: req.headers['authtoken'] });
  }

  @Get('/joinOneOnOneWbSession')
  @ApiHeader({ name: 'authtoken', required: true })
  @Roles(['student'])
  @UseGuards(AuthenticationGuard, RolesGuard)
  async joinOneOnOneWbSession(@Headers('instancekey') instancekey: string, @Query() query: JoinOneOnOneWbSessionQuery, @Req() req: any) {
    return this.authService.joinOneOnOneWbSession({ instancekey, query, user: req.user });
  }

  @Put('/updateOptionsData')
  @ApiHeader({ name: 'authtoken', required: true })
  @UseGuards(AuthenticationGuard)
  async updateOptionsData(@Headers('instancekey') instancekey: string, @Body() body: UpdateOptionsDataBody, @Req() req: any) {
    return this.authService.updateOptionsData({ instancekey, body, user: req.user });
  }

  @Put('/updateRole')
  @ApiHeader({ name: 'authtoken', required: true })
  @UseGuards(AuthenticationGuard)
  async updateRole(@Headers('instancekey') instancekey: string, @Body() body: UpdateRoleBody, @Req() req: any) {
    return this.authService.updateRole({ instancekey, body, user: req.user });
  }

  @Put('/updateTempUser')
  async updateTempUser(@Headers('instancekey') instancekey: string, @Body() body: UpdateTempUserBody, @Req() req: any) {
    return this.authService.updateTempUser({ instancekey, body, user: req.user });
  }

  @Put('/updateProfile/:id')
  @ApiHeader({ name: 'authtoken', required: true })
  @UseGuards(AuthenticationGuard)
  async updateAdditionalData(@Headers('instancekey') instancekey: string, @Body() body: UpdateAdditionalDataBody, @Req() req: any) {
    return this.authService.updateAdditionalData({ instancekey, body, user: req.user });
  }

  @Get('/userLiveBoard')
  @ApiHeader({ name: 'authtoken', required: true })
  @UseGuards(AuthenticationGuard)
  async userLiveBoard(@Headers('instancekey') instancekey: string, @Query() query: UserLiveBoardQuery) {
    return this.authService.userLiveBoard({ instancekey, query });
  }

  @Get('validateUserPicture')
  @ApiHeader({ name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  async validateUserPicture(@Headers('instancekey') instancekey: string, @Req() req: any) {
    return this.authService.validateUserPicture({ instancekey, user: req.user });
  }


  @Get('/users')
  @ApiHeader({ name: 'authtoken' })
  @Roles(['admin', 'centerHead', 'teacher', 'director', 'support', 'operator', 'publisher'])
  @UseGuards(AuthenticationGuard, RolesGuard)
  async find(@Headers('instancekey') instancekey: string, @Query() query: FindQuery, @Req() req: any) {
    return this.authService.find({ instancekey, query, userdata: req.user });
  }

  @Get(':id')
  @ApiHeader({ name: 'authtoken' })
  @UseGuards(AuthenticationGuard)
  async getUser(@Param('id') id: string, @Headers('instancekey') instancekey: string) {
    console.log(`id....${id}`)
    return this.authService.getUser({ instancekey, _id: id });
  }

  @Put(':id')
  @ApiHeader({ name: 'authtoken' })
  @ApiHeader({ name: 'instancekey' })
  @UseGuards(AuthenticationGuard)
  async update(@Param('id') id: string, @Req() req: any, @Body() request: UpdateRequest) {
    const combinedData = { ...request };
    combinedData.instancekey = req.headers['instancekey'];
    combinedData.id = id;
    combinedData.user = req.user;
    return this.authService.update(combinedData);
  }

}
