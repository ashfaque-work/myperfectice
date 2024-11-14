import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '../../abstract.schema';

interface Urls {
    facebookUrl?: string;
    googleUrl?: string;
    twitterUrl?: string;
    linkedinUrl?: string;
    blog?: string;
    forum?: string;
}

interface MobileUrl {
    android?: string;
    ios?: string;
}

interface Contact {
    phoneNumber?: string;
    email?: string;
    address?: string;
    legalName?: string;
}

interface SignupType {
    google?: boolean;
    facebook?: boolean;
    local?: boolean;
}
interface FacebookAuth {
    clientID?: string;
    clientSecret?: string;
    callbackURL?: string;
}

interface GoogleAuth {
    clientID?: string;
    clientSecret?: string;
    callbackURL?: string;
}
interface Features {
    chat?: boolean;
    hideCodeQuestionOutput?: boolean;
    examschedules?: boolean;
    triviaGame?: boolean;
    classAttendance?: boolean;
    editProfile?: boolean;
    liveBoardForTeacher?: boolean;
    classroomProctoring?: boolean;
    partialCodingMark?: boolean;

    parent?: boolean;
    students?: boolean;
    teacher?: boolean;
    operators?: boolean;
    support?: boolean;
    director?: boolean;

    liveboard?: boolean;
    course?: boolean;
    testseries?: boolean;
    dashboard?: boolean;
    classroom?: boolean;
    evaluation?: boolean;
    resume?: boolean;
    mentors?: boolean;
    marketplace?: boolean;
    adaptive?: boolean;

    faceDetect?: boolean;
    fraudDetect?: boolean;
    universityExam?: boolean;
    codeeditor?: boolean;
    whiteboard?: boolean;

    captureAdditionalInfo?: boolean;
    courseReminder?: boolean;
    services?: boolean;
    showBanner?: boolean;
    codeEditor?: boolean;
    myEffort?: boolean;
    myOutcome?: boolean;
    myProfile?: boolean;
    myEducoins?: boolean;
    ambassadorProgram?: boolean;
    accountVerification?: boolean;
    studentLevel?: boolean;
    studentWeeklyReport?: boolean;
    newInstitute?: boolean;
    joinInstitute?: boolean;
}

interface Payment {
    ccA: {
        workingKey?: string;
        accessCode?: string;
        merchantId?: number;
    };
    redirectUrl?: string;
    cancelUrl?: string;
}

interface Roles {
    student?: boolean;
    teacher?: boolean;
    director?: boolean;
    support?: boolean;
    operator?: boolean;
    publisher?: boolean;
    mentor?: boolean;
}

interface TipOfDay {
    imageUrl?: string;
    title?: string;
    summary?: string;
    url?: string;
}

interface Country {
    code: string;
    name: string;
}
interface PageLogoSocial {
    twitter?: string;
    facebook?: string;
}

interface PageLogo {
    id?: string;
    path?: string;
    url?: string;
    name?: string;
}

interface CurrencyUsEx {
    INR?: number;
    USD?: number;
}

interface ProfileDistribution {
    basicProfile?: number;
    trainingCertifications?: number;
    educationDetails?: number;
    entranceExam?: number;
    interestedSubject?: number;
    longTermGoal?: number;
    shortTermGoal?: number;
    programmingLang?: number;
    externalAssessment?: number;
}

interface BannerImage {
    type?: string;
    header?: string;
    title?: string;
    url?: string;
    redirect?: string;
}

interface IdentityInfo {
    identityVerification?: string;
    collegeName?: string;
    coreBranch?: string;
    passingYear?: string;
    identificationNumber?: string;
    rollNumber?: string;
    gender?: string;
    dob?: string;
    state?: string;
    city?: string;
}

interface ResumeTemplate {
    displayName?: string;
    htmlFile?: string;
    active?: boolean;
}
@Schema({ timestamps: true, versionKey: false })
export class Setting extends AbstractDocument {
    @Prop({ required: true })
    slug: string;

    @Prop({ type: Object })
    urls: Urls;

    @Prop({ type: Object })
    mobileUrl: MobileUrl;

    @Prop({ type: Object })
    contact: Contact;

    @Prop({ type: Object })
    signupType: SignupType;

    @Prop({ default: false })
    eCommerce: boolean;

    @Prop()
    themeColor: string;

    @Prop()
    adminName: string;
    @Prop()
    emailLogo: string;
    @Prop()
    browserIcon: string;
    @Prop()
    supportEmail: string;
    @Prop()
    productName: string;
    @Prop()
    logOutState: string;
    @Prop()
    fbAppId: string;
    @Prop()
    copyRight: string;
    @Prop()
    website: string;
    @Prop({ default: false })
    isWhiteLabelled: boolean;
    @Prop({ type: Object })
    facebookAuth: FacebookAuth;
    @Prop({ type: Object })
    googleAuth: GoogleAuth;

    @Prop({
        type: Object,
        default: {
            chat: false,
            hideCodeQuestionOutput: false,
            examschedules: false,
            triviaGame: false,
            classAttendance: false,
            editProfile: false,
            liveBoardForTeacher: false,
            classroomProctoring: false,
            partialCodingMark: false,
            parent: false,
            students: false,
            teacher: false,
            operators: false,
            support: false,
            director: false,
            liveboard: false,
            course: false,
            testseries: false,
            dashboard: false,
            classroom: false,
            evaluation: false,
            resume: false,
            mentors: false,
            marketplace: false,
            adaptive: false,
            faceDetect: false,
            fraudDetect: false,
            universityExam: false,
            codeeditor: false,
            whiteboard: false,
            captureAdditionalInfo: false,
            courseReminder: false,
            services: false,
            showBanner: false,
            codeEditor: true,
            myEffort: true,
            myOutcome: true,
            myProfile: true,
            myEducoins: true,
            ambassadorProgram: true,
            accountVerification: true,
            studentLevel: false,
            studentWeeklyReport: false,
            newInstitute: false,
            joinInstitute: false
        }
    })
    features: Features;

    @Prop({ type: Object })
    roles: Roles;

    @Prop({ type: [{ type: Object }] })
    tipOfDay: TipOfDay[];

    @Prop()
    linkedInOrgId: string;

    @Prop({ default: false })
    publisher: boolean;

    @Prop({ type: [{ type: Object }] })
    countries: Country[];

    @Prop({ type: Object, default: {} })
    value: Record<string, any>;

    @Prop({ type: Object })
    payment: Payment;

    @Prop({ type: String })
    mobileVersion: string;

    @Prop({ type: Object })
    pageLogoSocial: PageLogoSocial;

    @Prop({ type: Object })
    pageLogo: PageLogo;

    @Prop({ type: String })
    currency: string;

    @Prop({ type: String })
    pageTitle: string;

    @Prop()
    testimonials: any[];

    @Prop({ type: String })
    notification: string;

    @Prop({ default: false })
    singleSignOn: boolean;

    @Prop({ default: false })
    detectFraud: boolean;

    @Prop({ default: false })
    allowMarksChange: boolean;

    @Prop({ default: new Date() })
    updatedAt: Date;

    @Prop({ type: Object })
    currencyUsEx: CurrencyUsEx;

    @Prop({ type: Object })
    profileDistribution: ProfileDistribution;

    @Prop({ enum: ['center', 'instance'], default: 'instance' })
    contentVisibility: string;

    @Prop({ type: Number, default: 0 })
    identityMatchThreshold: number;

    @Prop([{
        type: { type: String, enum: ['testseries', 'course', 'dashboard', 'assessment', 'classroom'] },
        header: { type: String },
        title: { type: String },
        url: { type: String },
        redirect: { type: String },
    }])
    bannerImages: BannerImage[];

    @Prop({ type: [String] })
    contentProviders: string[];

    @Prop({ type: Object })
    identityInfo: IdentityInfo;

    @Prop({ type: String })
    signupMsg: string;

    @Prop({ type: String })
    assessmentInstructions: string;

    @Prop({ type: [Object] })
    resumeTemplates: ResumeTemplate[];

    @Prop({ default: 10 })
    ambassadorDiscount: number;

    @Prop({ default: false })
    useAttemptQueue: boolean;

    @Prop({ type: String })
    baseUrl: string;
}

export const SettingSchema = SchemaFactory.createForClass(Setting);
