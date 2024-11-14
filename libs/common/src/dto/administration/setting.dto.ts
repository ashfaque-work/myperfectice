import { Role } from '@app/common/enums';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

class Urls {
    @ApiProperty()
    facebookUrl?: string;
    @ApiProperty()
    googleUrl?: string;
    @ApiProperty()
    twitterUrl?: string;
    @ApiProperty()
    linkedinUrl?: string;
    @ApiProperty()
    blog?: string;
    @ApiProperty()
    forum?: string;
}

class MobileUrl {
    @ApiProperty()
    android?: string;
    @ApiProperty()
    ios?: string;
}

class Contact {
    @ApiProperty()
    phoneNumber?: string;
    @ApiProperty()
    email?: string;
    @ApiProperty()
    address?: string;
    @ApiProperty()
    legalName?: string;
}

class SignupType {
    @ApiProperty({ required: false })
    google?: boolean;
    @ApiProperty({ required: false })
    facebook?: boolean;
    @ApiProperty({ required: false })
    local?: boolean;
}

class FacebookAuth {
    @ApiProperty()
    clientID?: string;
    @ApiProperty()
    clientSecret?: string;
    @ApiProperty()
    callbackURL?: string;
}

class GoogleAuth {
    @ApiProperty()
    clientID?: string;
    @ApiProperty()
    clientSecret?: string;
    @ApiProperty()
    callbackURL?: string;
}

class Features {
    // feature tabs
    @ApiProperty({ required: false })
    chat: boolean;
    @ApiProperty({ required: false })
    hideCodeQuestionOutput: boolean;
    @ApiProperty({ required: false })
    examschedules: boolean;
    @ApiProperty({ required: false })
    triviaGame: boolean;
    @ApiProperty({ required: false })
    classAttendance: boolean;
    @ApiProperty({ required: false })
    editProfile: boolean;
    @ApiProperty({ required: false })
    liveBoardForTeacher: boolean;
    @ApiProperty({ required: false })
    classroomProctoring: boolean;
    @ApiProperty({ required: false })
    evaluation: boolean;
    @ApiProperty({ required: false })
    partialCodingMark: boolean;

    // role Tab
    @ApiProperty({ required: false })
    parent: boolean;
    @ApiProperty({ required: false })
    students: boolean;
    @ApiProperty({ required: false })
    teacher: boolean;
    @ApiProperty({ required: false })
    operators: boolean;
    @ApiProperty({ required: false })
    support: boolean;
    @ApiProperty({ required: false })
    director: boolean;

    //modules tabs
    @ApiProperty({ required: false })
    liveboard: boolean;
    @ApiProperty({ required: false })
    course: boolean;
    @ApiProperty({ required: false })
    testseries: boolean;
    @ApiProperty({ required: false })
    classroom: boolean;
    @ApiProperty({ required: false })
    dashboard: boolean;
    @ApiProperty({ required: false })
    resume: boolean;
    @ApiProperty({ required: false })
    mentors: boolean;
    @ApiProperty({ required: false })
    marketplace: boolean;
    @ApiProperty({ required: false })
    adaptive: boolean;

    //exam & proctor
    @ApiProperty({ required: false })
    faceDetect: boolean;
    @ApiProperty({ required: false })
    fraudDetect: boolean;
    @ApiProperty({ required: false })
    universityExam: boolean;
    @ApiProperty({ required: false })
    whiteboard: boolean;

    @ApiProperty({ required: false })
    captureAdditionalInfo: boolean;
    @ApiProperty({ required: false })
    courseReminder: boolean;    
    @ApiProperty({ required: false })
    services: boolean;

    @ApiProperty({ required: false })
    showBanner: boolean;
    
    @ApiProperty({ required: false })
    myEffort: boolean;

    @ApiProperty({ required: false })
    myOutcome: boolean;

    @ApiProperty({ required: false })
    myProfile: boolean;

    @ApiProperty({ required: false })
    myEducoins: boolean;

    @ApiProperty({ required: false })
    codeEditor: boolean;

    @ApiProperty({ required: false })
    ambassadorProgram: boolean;

    @ApiProperty({ required: false })
    accountVerification: boolean;

    @ApiProperty({ required: false })
    studentLevel: boolean;

    // weekly repot 
    @ApiProperty({ required: false })
    studentWeeklyReport: boolean;
    @ApiProperty({ required: false })
    newInstitute: boolean;
    @ApiProperty({ required: false })
    joinInstitute: boolean;
}
class Cca {
    @ApiProperty()
    workingKey?: string;
    @ApiProperty()
    accessCode?: string;
    @ApiProperty()
    merchantId?: number;
}

class Payment {
    @ApiProperty({ type: Cca })
    ccA: Cca;
    @ApiProperty()
    redirectUrl?: string;
    @ApiProperty()
    cancelUrl?: string;
}

class Roles {
    @ApiProperty({ required: false })
    student?: boolean;
    @ApiProperty({ required: false })
    teacher?: boolean;
    @ApiProperty({ required: false })
    director?: boolean;
    @ApiProperty({ required: false })
    support?: boolean;
    @ApiProperty({ required: false })
    operator?: boolean;
    @ApiProperty({ required: false })
    publisher?: boolean;
    @ApiProperty({ required: false })
    mentor?: boolean;
}

class TipOfDay {
    @ApiProperty()
    imageUrl?: string;
    @ApiProperty()
    title?: string;
    @ApiProperty()
    summary?: string;
    @ApiProperty()
    url?: string;
}

class Country {
    @ApiProperty()
    code: string;
    @ApiProperty()
    name: string;
}

class PageLogoSocial {
    @ApiProperty()
    twitter?: string;
    @ApiProperty()
    facebook?: string;
}

class PageLogo {
    @ApiProperty({ required: false })
    id?: string;
    @ApiProperty({ required: false })
    path?: string;
    @ApiProperty({ required: false })
    url?: string;
    @ApiProperty({ required: false })
    name?: string;
}

class CurrencyUsEx {
    @ApiProperty()
    INR?: number;
    @ApiProperty()
    USD?: number;
}

class ProfileDistribution {
    @ApiProperty()
    basicProfile?: number;
    @ApiProperty()
    trainingCertifications?: number;
    @ApiProperty()
    educationDetails?: number;
    @ApiProperty()
    entranceExam?: number;
    @ApiProperty()
    interestedSubject?: number;
    @ApiProperty()
    longTermGoal?: number;
    @ApiProperty()
    shortTermGoal?: number;
    @ApiProperty()
    programmingLang?: number;
    @ApiProperty()
    externalAssessment?: number;
}

class BannerImage {
    @ApiProperty({ enum: ['testseries', 'course', 'dashboard', 'assessment', 'classroom'], default: 'dashboard' })
    type?: string;
    @ApiProperty()
    header?: string;
    @ApiProperty()
    title?: string;
    @ApiProperty()
    url?: string;
    @ApiProperty()
    redirect?: string;
}

class IdentityInfo {
    @ApiProperty({ required: false })
    identityVerification?: string;
    @ApiProperty({ required: false })
    collegeName?: string;
    @ApiProperty({ required: false })
    coreBranch?: string;
    @ApiProperty({ required: false })
    passingYear?: string;
    @ApiProperty({ required: false })
    identificationNumber?: string;
    @ApiProperty({ required: false })
    rollNumber?: string;
    @ApiProperty({ required: false })
    gender?: string;
    @ApiProperty({ required: false })
    dob?: string;
    @ApiProperty({ required: false })
    state?: string;
    @ApiProperty({ required: false })
    city?: string;
}

class ResumeTemplate {
    @ApiProperty()
    displayName?: string;
    @ApiProperty()
    htmlFile?: string;
    @ApiProperty()
    active?: boolean;
}

export class SettingRequest {
    @ApiProperty()
    slug: string;
    @ApiProperty({ type: Urls })
    urls: Urls;
    @ApiProperty({ type: MobileUrl })
    mobileUrl: MobileUrl;
    @ApiProperty({ type: Contact })
    contact: Contact;
    @ApiProperty({ type: SignupType })
    signupType: SignupType;
    @ApiProperty()
    eCommerce: boolean;
    @ApiProperty()
    themeColor: string;
    @ApiProperty()
    adminName: string;
    @ApiProperty()
    emailLogo: string;
    @ApiProperty()
    browserIcon: string;
    @ApiProperty()
    supportEmail: string;
    @ApiProperty()
    productName: string;
    @ApiProperty()
    logOutState: string;
    @ApiProperty()
    fbAppId: string;
    @ApiProperty()
    copyRight: string;
    @ApiProperty()
    website: string;
    @ApiProperty()
    isWhiteLabelled: boolean;
    @ApiProperty({ type: FacebookAuth })
    facebookAuth: FacebookAuth;
    @ApiProperty({ type: GoogleAuth })
    googleAuth: GoogleAuth;
    @ApiProperty({ type: Features })
    features: Features;
    @ApiProperty({ type: Roles })
    roles: Roles;
    @ApiProperty({ type: [TipOfDay] })
    tipOfDay: TipOfDay[];
    @ApiProperty()
    linkedInOrgId: string;
    @ApiProperty()
    publisher: boolean;
    @ApiProperty({ type: [Country] })
    countries: Country[];
    @ApiProperty()
    value: Record<string, any>;
    @ApiProperty({ type: Payment })
    payment: Payment;
    @ApiProperty()
    mobileVersion: string;
    @ApiProperty({ type: PageLogoSocial })
    pageLogoSocial: PageLogoSocial;
    @ApiProperty({ type: PageLogo })
    pageLogo: PageLogo;
    @ApiProperty()
    currency: string;
    @ApiProperty()
    pageTitle: string;
    @ApiProperty({ type: [String] })
    testimonials: string[];
    @ApiProperty()
    notification: string;
    @ApiProperty()
    singleSignOn: boolean;
    @ApiProperty()
    detectFraud: boolean;
    @ApiProperty()
    allowMarksChange: boolean;
    @ApiProperty()
    updatedAt: Date;
    @ApiProperty({ type: CurrencyUsEx })
    currencyUsEx: CurrencyUsEx;
    @ApiProperty({ type: ProfileDistribution })
    profileDistribution: ProfileDistribution;
    @ApiProperty({ enum: ['center', 'instance'], default: 'instance' })
    contentVisibility: string;
    @ApiProperty()
    identityMatchThreshold: number;
    @ApiProperty({ type: [BannerImage] })
    bannerImages: BannerImage[];
    @ApiProperty({ type: [String] })
    contentProviders: string[];
    @ApiProperty({ type: IdentityInfo })
    identityInfo: IdentityInfo;
    @ApiProperty()
    signupMsg: string;
    @ApiProperty()
    assessmentInstructions: string;
    @ApiProperty({ type: [ResumeTemplate] })
    resumeTemplates: ResumeTemplate[];
    @ApiProperty()
    ambassadorDiscount: number;
    @ApiProperty()
    useAttemptQueue: boolean;
    @ApiProperty()
    baseUrl: string;
    instacneKey: string;
}


export class Setting {
    @ApiProperty()
    _id: string;
    @ApiProperty()
    slug: string;
    @ApiProperty({ type: Urls })
    urls: Urls;
    @ApiProperty({ type: MobileUrl })
    mobileUrl: MobileUrl;
    @ApiProperty({ type: Contact })
    contact: Contact;
    @ApiProperty({ type: SignupType })
    signupType: SignupType;
    @ApiProperty()
    eCommerce: boolean;
    @ApiProperty()
    themeColor: string;
    @ApiProperty()
    adminName: string;
    @ApiProperty()
    emailLogo: string;
    @ApiProperty()
    browserIcon: string;
    @ApiProperty()
    supportEmail: string;
    @ApiProperty()
    productName: string;
    @ApiProperty()
    logOutState: string;
    @ApiProperty()
    fbAppId: string;
    @ApiProperty()
    copyRight: string;
    @ApiProperty()
    website: string;
    @ApiProperty()
    isWhiteLabelled: boolean;
    @ApiProperty({ type: FacebookAuth })
    facebookAuth: FacebookAuth;
    @ApiProperty({ type: GoogleAuth })
    googleAuth: GoogleAuth;
    @ApiProperty({ type: Features })
    features: Features;
    @ApiProperty({ type: Roles })
    roles: Roles;
    @ApiProperty({ type: [TipOfDay] })
    tipOfDay: TipOfDay[];
    @ApiProperty()
    linkedInOrgId: string;
    @ApiProperty()
    publisher: boolean;
    @ApiProperty({ type: [Country] })
    countries: Country[];
    @ApiProperty()
    value: Record<string, any>;
    @ApiProperty({ type: Payment })
    payment: Payment;
    @ApiProperty()
    mobileVersion: string;
    @ApiProperty({ type: PageLogoSocial })
    pageLogoSocial: PageLogoSocial;
    @ApiProperty({ type: PageLogo })
    pageLogo: PageLogo;
    @ApiProperty()
    currency: string;
    @ApiProperty()
    pageTitle: string;
    @ApiProperty({ type: [String] })
    testimonials: string[];
    @ApiProperty()
    notification: string;
    @ApiProperty()
    singleSignOn: boolean;
    @ApiProperty()
    detectFraud: boolean;
    @ApiProperty()
    allowMarksChange: boolean;
    @ApiProperty()
    updatedAt: Date;
    @ApiProperty({ type: CurrencyUsEx })
    currencyUsEx: CurrencyUsEx;
    @ApiProperty({ type: ProfileDistribution })
    profileDistribution: ProfileDistribution;
    @ApiProperty({ enum: ['center', 'instance'], default: 'instance' })
    contentVisibility: string;
    @ApiProperty()
    identityMatchThreshold: number;
    @ApiProperty({ type: [BannerImage] })
    bannerImages: BannerImage[];
    @ApiProperty({ type: [String] })
    contentProviders: string[];
    @ApiProperty({ type: IdentityInfo })
    identityInfo: IdentityInfo;
    @ApiProperty()
    signupMsg: string;
    @ApiProperty()
    assessmentInstructions: string;
    @ApiProperty({ type: [ResumeTemplate] })
    resumeTemplates: ResumeTemplate[];
    @ApiProperty()
    ambassadorDiscount: number;
    @ApiProperty()
    useAttemptQueue: boolean;
}

export class SettingResponse {
    @ApiProperty()
    response: Setting
}

export class GetSettingResponse {
    @ApiProperty()
    response: Setting[];
}

export class GetOneSettingRequest {
    @ApiProperty()
    slug: string;
}

export class GetOneSettingResponse {
    @ApiProperty()
    response: Setting;
}

export class UpdateSettingRequest {
    @ApiProperty()
    _id: string;
    @ApiProperty()
    slug: string;
    @ApiProperty({ type: Urls })
    urls: Urls;
    @ApiProperty({ type: MobileUrl })
    mobileUrl: MobileUrl;
    @ApiProperty({ type: Contact })
    contact: Contact;
    @ApiProperty({ type: SignupType })
    signupType: SignupType;
    @ApiProperty()
    eCommerce: boolean;
    @ApiProperty()
    themeColor: string;
    @ApiProperty()
    adminName: string;
    @ApiProperty()
    emailLogo: string;
    @ApiProperty()
    browserIcon: string;
    @ApiProperty()
    supportEmail: string;
    @ApiProperty()
    productName: string;
    @ApiProperty()
    logOutState: string;
    @ApiProperty()
    fbAppId: string;
    @ApiProperty()
    copyRight: string;
    @ApiProperty()
    website: string;
    @ApiProperty()
    isWhiteLabelled: boolean;
    @ApiProperty({ type: FacebookAuth })
    facebookAuth: FacebookAuth;
    @ApiProperty({ type: GoogleAuth })
    googleAuth: GoogleAuth;
    @ApiProperty({ type: Features })
    features: Features;
    @ApiProperty({ type: Roles })
    roles: Roles;
    @ApiProperty({ type: [TipOfDay] })
    tipOfDay: TipOfDay[];
    @ApiProperty()
    linkedInOrgId: string;
    @ApiProperty()
    publisher: boolean;
    @ApiProperty({ type: [Country] })
    countries: Country[];
    @ApiProperty()
    value: Record<string, any>;
    @ApiProperty({ type: Payment })
    payment: Payment;
    @ApiProperty()
    mobileVersion: string;
    @ApiProperty({ type: PageLogoSocial })
    pageLogoSocial: PageLogoSocial;
    @ApiProperty({ type: PageLogo })
    pageLogo: PageLogo;
    @ApiProperty()
    currency: string;
    @ApiProperty()
    pageTitle: string;
    @ApiProperty({ type: [String] })
    testimonials: string[];
    @ApiProperty()
    notification: string;
    @ApiProperty()
    singleSignOn: boolean;
    @ApiProperty()
    detectFraud: boolean;
    @ApiProperty()
    allowMarksChange: boolean;
    @ApiProperty()
    updatedAt: Date;
    @ApiProperty({ type: CurrencyUsEx })
    currencyUsEx: CurrencyUsEx;
    @ApiProperty({ type: ProfileDistribution })
    profileDistribution: ProfileDistribution;
    @ApiProperty({ enum: ['center', 'instance'], default: 'instance' })
    contentVisibility: string;
    @ApiProperty()
    identityMatchThreshold: number;
    @ApiProperty({ type: [BannerImage] })
    bannerImages: BannerImage[];
    @ApiProperty({ type: [String] })
    contentProviders: string[];
    @ApiProperty({ type: IdentityInfo })
    identityInfo: IdentityInfo;
    @ApiProperty()
    signupMsg: string;
    @ApiProperty()
    assessmentInstructions: string;
    @ApiProperty({ type: [ResumeTemplate] })
    resumeTemplates: ResumeTemplate[];
    @ApiProperty()
    ambassadorDiscount: number;
    @ApiProperty()
    useAttemptQueue: boolean;
}

export class UpdateSettingResponse {
    @ApiProperty()
    response: Setting[];
}

export class AddAdvertismentImageReq {
    @ApiProperty()
    url: string;

    @ApiProperty()
    title: string;
}

export class AddAdvertismentImageRes {
    @ApiProperty()
    response: Setting[];
}

export class DeleteAdvertismentImageReq {
    @ApiProperty()
    @IsNotEmpty()
    _id: string
}

export class DeleteAdvertismentImageRes {
    @ApiProperty()
    response: Setting[];
}

export class UserCountry {
    code: string;
    name: string;
    currency: string;
}

class Preference {
    publicProfile: boolean;
    myWatchList: boolean;
    leastPracticeDaily: boolean;
    resumesRequests: boolean;
    mentoringRequests: boolean;
    addingStudents: boolean;
    createAndPublishTest: boolean;
    viewExistingAssessment: boolean;
}

export class LevelHistory {
    _id: string;
    subjectId: string;
    level: number;
    updateDate: Date;
    gradeName: string;
    gradeId: string;
}

export class User {
    _id: string;
    name: string;
    roles: string[];
    country: UserCountry;
    activeLocation: string;
    isVerified: boolean;
    userId: string;
    subjects: string[];
    phoneNumberFull: string;
    practiceViews: string[];
    locations: string[];
    preferences: Preference;
    isActive: boolean;
    email: string;
    phoneNumber: string;
    levelHistory: LevelHistory[];
    createdAt: string;
}

export class GetConvertCurrencyReq {
    @ApiProperty()
    to?: string;
    @ApiProperty()
    from?: string;
    instancekey: string;
    user: User;
}

export class GetConvertCurrencyRes {
    @ApiProperty()
    response: string;
}

export class DeleteSettingRequest {
    @ApiProperty()
    _id: string;
}

export class DeleteSettingResponse {
    _id: string;
    slug: string;
}

export class FindOneRequest {
    @ApiProperty()
    slug: string
}

export class FindOneResponse {
    @ApiProperty()
    response: Setting[];
}

export class GetCurrentDateTimeRes {
    @ApiProperty()
    response: Date;
}

export class GetCodeEngineAddressRes {
    @ApiProperty()
    response: string;
}

export class GetWhiteLabelReq {
    @ApiProperty()
    instancekey: string;
}

export class GetPaymentMethodsReq {
    @ApiProperty()
    country: Country;
    instancekey: string;
}

class PaymentMethods {
    name: string;
    isSandbox?: boolean;
    id?: string;
    keyId?: string
}

export class GetPaymentMethodsRes {
    @ApiProperty()
    methods: PaymentMethods[]

    @ApiProperty()
    currency: string
}

export class GetWhiteLabelRes {
    @ApiProperty()
    response: Setting[];
}

export class GetFindAllReq {
    @ApiProperty()
    slugs: string;
}

export class GetFindAllRes {
    @ApiProperty()
    response: Setting;
}

export class ShowRes {
    @ApiProperty()
    response: Setting;
}

export class GetDeploymentStatusRes {
    @ApiProperty()
    status: string
}

export class GetCountryByIpReq {
    @ApiProperty()
    instancekey: string

    @ApiProperty()
    ip: string
}

export class GetCountryByIpRes {
    code: string;
    name: string;
}

class Socket {
    active: boolean;
}

class Webrtc {
    active: boolean;
}

class Turns {
    server: string;
    secret: string;
    active: boolean;
}

class VideoStream {
    _id: string;
    slug: string;
    socket: Socket;
    webrtc: Webrtc;
    turns: Turns[]
}

export class GetVideoStreamingReq {
    @ApiProperty()
    @IsNotEmpty()
    instancekey: string
}

export class GetVideoStreamingRes {
    response: VideoStream
}

export class NotificationTemplates {
    @ApiProperty({ required: false })
    _id: string;
    @ApiProperty({ required: false })
    active: boolean;
}

export class GetUpdateRequest {
    @ApiProperty({ required: false })
    features?: Features;
    @ApiProperty({ required: false })
    identityInfo?: IdentityInfo;
    @ApiProperty({ required: false })
    roles?: Roles;
    @ApiProperty({ required: false })
    signupMsg?: string;
    @ApiProperty({ required: false })
    assessmentInstructions?: string;
    
    @ApiProperty({ required: false, type: PageLogo })
    pageLogo?: PageLogo;

    @ApiProperty({ required: false })
    detectFraud?: boolean;
    @ApiProperty({ required: false })
    allowMarksChange?: boolean;
    @ApiProperty({ required: false })
    identityMatchThreshold?: number;

    @ApiProperty({ required: false, type: SignupType })
    signupType?: SignupType;
    @ApiProperty({ required: false })
    ambassadorDiscount?: number;
    
    @ApiProperty({ required: false, type: [NotificationTemplates] })
    notificationTemplates?: NotificationTemplates[];
}

export class GetUpdateResponse {
    @ApiProperty()
    response: Setting;
}