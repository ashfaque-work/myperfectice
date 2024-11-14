import { config, getAssets } from "@app/common/config";
import {
    CreateCourseReq, CreateEvaluationReq, CreateNewsReq, CreateProgramOutcomeReq, DeleteCourseReq, DeleteEvaluationReq, DeleteProgramOutcomeReq,
    ExportExamDataWordTemplateReq,
    GetAccAttReq, GetAccreditationSettingsReq, GetAccReportReq, GetMailTemplatesReq, GetNewsReq, GetPowerBIEmbedTokenReq, GetProgramOutcomesReq, GetReportDataReq,
    GetReportReq, GetReportsReq, MapTestToClassroomReq, RunBulkMailDataSourceReq, SendBulkMailReq, TestBulkMailReq, TestMailByKeyReq, UpdateAccSettingReq,
    UpdateBulkMailReq, UpdateCourseReq, UpdateEvaluationReq, UpdateNewsReq, UpdateProgramOutcomeReq,
    UploadCampaignMailSourceReq
} from "@app/common/dto/userManagement/admin.dto";
import { HttpService } from "@nestjs/axios";
import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { AxiosError, AxiosResponse } from "axios";
import { GrpcInternalException, GrpcInvalidArgumentException, GrpcNotFoundException } from "nestjs-grpc-exceptions";
import { catchError } from 'rxjs/operators';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import {
    AccreditationAttainmentsRepository, AccreditationCoursesRepository, AccreditationEvaluationsRepository, AccreditationReportsRepository,
    AccreditationSettingsRepository, ClassroomRepository, escapeRegex, isEmail, NewsRepository, NotificationTemplateRepository,
    RedisCaching, ReportRepository, UsersRepository, ProgramOutcomeRepository,
    PracticeSetRepository,
    replacer,
    SubjectRepository,
} from "@app/common";
import { MessageCenter } from "@app/common/components/messageCenter";
import { Types } from "mongoose";
import * as path from 'path';
import * as xlsx from 'xlsx';
import * as moment from 'moment';
import { ObjectId } from 'mongodb';
import * as fsExtra from 'fs-extra';
import { Workbook } from 'exceljs';
import * as fs from 'fs';
import * as zipper from 'zip-local';
import XMLWriter from 'xml-writer';


@Injectable()
export class AdminService {
    constructor(
        private readonly reportRepository: ReportRepository,
        private readonly notificationTemplateRepository: NotificationTemplateRepository,
        private readonly usersRepository: UsersRepository,
        private readonly classroomRepository: ClassroomRepository,
        private readonly programOutcomeRepository: ProgramOutcomeRepository,
        private readonly accreditationCoursesRepository: AccreditationCoursesRepository,
        private readonly accreditationEvaluationsRepository: AccreditationEvaluationsRepository,
        private readonly accreditationSettingsRepository: AccreditationSettingsRepository,
        private readonly accreditationReportsRepository: AccreditationReportsRepository,
        private readonly accreditationAttainmentsRepository: AccreditationAttainmentsRepository,
        private readonly practiceSetRepository: PracticeSetRepository,
        private readonly newsRepository: NewsRepository,
        private readonly subjectRepository: SubjectRepository,
        private readonly httpService: HttpService,
        private readonly redisCache: RedisCaching,
        private readonly messageCenter: MessageCenter
    ) { }

    // Internal Functions - start
    private async applyReportFilter(request: any, report: any): Promise<any> {
        try {
            const queryString = this.buildReportQueryString(request.query, false);
            let url = `${config.reportApi}${report.reportAPI}`;
            if (queryString) {
                url += '?' + queryString;
            }

            const redisKey = request.instancekey + '_' + report.reportAPI + '_' + queryString;
            const savedFilter: any = await this.redisCache.globalGetAsync(redisKey);

            if (savedFilter) {
                return savedFilter.data;
            }

            const response = await lastValueFrom(this.httpService.get(url, {
                headers: { 'instancekey': request.instancekey },
            }));
            const reportData = response.data;

            if (!reportData.data || reportData.data.length === 0) {
                await this.redisCache.globalSetex(redisKey, { data: false }, 60);
                return false;
            }

            if (report.reportSchema && report.reportSchema.fieldToColMap) {
                reportData.data.forEach(d => {
                    for (const f in report.reportSchema.fieldToColMap) {
                        const newName = report.reportSchema.fieldToColMap[f];
                        d[newName] = d[f];
                        delete d[f];
                    }
                });
            }

            const accessToken = await this.getADDAccessToken(request.instancekey);
            let dts = report.datasetId;

            if (!report.datasetId) {
                const newDataset = await this.generatePushDataset(accessToken, report, reportData.data);
                dts = newDataset.id;
                await this.reportRepository.updateOne({ _id: report._id }, { $set: { datasetId: dts } });
                report.datasetId = dts;
                await this.rebindReport(accessToken, report);
            }

            const headers = { 'Authorization': 'Bearer ' + accessToken };
            let tableName = report.reportAPI;
            let reportSection = '';

            if (report.reportSchema && report.reportSchema.tableMap) {
                try {
                    const sampleData = reportData.data[0];
                    if (report.reportSchema.tableMap === 'reportAPI') {
                        tableName = report.reportSchema.tables[report.reportAPI].name;
                    } else if (report.reportSchema.tableMap === 'period') {
                        tableName = report.reportSchema.tables[request.query.period].name;
                        reportSection = report.reportSchema.tables[request.query.period].reportSection;
                    } else {
                        tableName = report.reportSchema.tables[sampleData[report.reportSchema.tableMap]].name;
                        reportSection = report.reportSchema.tables[sampleData[report.reportSchema.tableMap]].reportSection;
                    }
                } catch (ex) {
                    if (report.reportSchema && report.reportSchema.tableMap === 'grade' && report.reportSchema.tables) {
                        const msg = 'Selected grade is not supported in this report. It only supports: ' +
                            Object.keys(report.reportSchema.tables).join(', ');
                        return Promise.reject({ msg });
                    }
                    Logger.error('fail to get report table name', ex);
                    return Promise.reject(ex);
                }
            }

            await lastValueFrom(this.httpService.delete(`https://api.powerbi.com/v1.0/myorg/groups/${report.groupId}/datasets/${dts}/tables/${tableName}/rows`, {
                headers,
            }));

            const rowsContainer = [];
            const chunk = 10000;
            for (let i = 0, j = reportData.data.length; i < j; i += chunk) {
                rowsContainer.push(reportData.data.slice(i, i + chunk));
            }

            for (const rows of rowsContainer) {
                await lastValueFrom(this.httpService.post(`https://api.powerbi.com/v1.0/myorg/groups/${report.groupId}/datasets/${dts}/tables/${tableName}/rows`, {
                    headers,
                    data: { rows },
                }));
            }

            await this.redisCache.globalSetex(redisKey, { data: reportSection }, 60);
            return reportSection;
        } catch (err) {
            Logger.error(err);
            throw err;
        }
    }

    private async getADDAccessToken(instancekey: string): Promise<string> {
        try {
            const cachedToken = await new Promise<any>((resolve, reject) => {
                this.redisCache.globalGet('ADDAccessToken', (result) => {
                    if (result) {
                        resolve(result);
                    } else {
                        resolve(null);
                    }
                });
            });

            if (cachedToken) {
                return cachedToken.token;
            }

            const url = 'https://login.microsoftonline.com/common/oauth2/token';
            const settings: any = await this.redisCache.getSettingAsync(instancekey);

            if (!settings || !settings.powerBI) {
                throw ('Missing PowerBI setting');
            }

            const { username, password, clientId } = settings.powerBI;
            const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
            const formData = {
                grant_type: 'password',
                client_id: clientId,
                resource: 'https://analysis.windows.net/powerbi/api',
                scope: 'openid',
                username,
                password,
            };

            const result = await lastValueFrom(this.httpService.post(url, formData, { headers }));
            const bodyObj = result.data;

            if (bodyObj.error) {
                throw (bodyObj.error);
            }

            await this.redisCache.globalSetex('ADDAccessToken', { token: bodyObj.access_token }, 60 * 60);
            return bodyObj.access_token;
        } catch (err) {
            Logger.error(err);
            throw err;
        }
    }

    private buildReportQueryString(query: any, download: boolean): string {
        let queryString = download ? 'download=1&' : '';

        if (query.testseries) {
            queryString += `testseriesId=${query.testseries}&`;
        }
        if (query.tests) {
            queryString += `testIds=${query.tests}&`;
        } else if (query.test) {
            queryString += `testId=${query.test}&`;
        }
        if (query.subjects) {
            queryString += `subjectIds=${query.subjects}&`;
        } else if (query.subject) {
            queryString += `subjectId=${query.subject}&`;
        }
        if (query.passingYear) {
            queryString += `passingYear=${query.passingYear}&`;
        }
        if (query.center) {
            queryString += `center=${query.center}&`;
        }
        if (query.course) {
            queryString += `courseId=${query.course}&`;
        }
        if (query.user) {
            queryString += `userId=${query.user}&`;
        }
        if (query.classrooms) {
            queryString += `classIds=${query.classrooms}&`;
        } else if (query.classroom) {
            queryString += `classId=${query.classroom}&`;
        }
        if (query.mentor) {
            queryString += `mentorId=${query.mentor}&`;
        }
        if (query.startDate) {
            queryString += `startDate=${query.startDate}&`;
        }
        if (query.endDate) {
            queryString += `endDate=${query.endDate}&`;
        }

        // Remove the trailing '&'
        if (queryString.endsWith('&')) {
            queryString = queryString.slice(0, -1);
        }

        return queryString;
    }

    private async generatePushDataset(accessToken: string, report: any, reportData: any[]): Promise<any> {
        const name = report.reportAPI;
        const groupId = report.groupId;
        const reportId = report.reportId;
        Logger.debug('GeneratePushDataset');

        return new Promise((resolve, reject) => {
            const headers = {
                'Authorization': `Bearer ${accessToken}`
            };

            const columns = [];
            const sampleData = reportData[0];
            for (const i in sampleData) {
                let dataType = 'string';
                const sampleType = typeof sampleData[i];
                if (sampleType === 'number') {
                    dataType = 'Double';
                } else if (sampleType === 'boolean') {
                    dataType = 'bool';
                }
                columns.push({
                    name: i,
                    dataType: dataType
                });
            }

            const tables = [];
            // Build specific table schema for this report
            if (report.reportSchema && report.reportSchema.tables) {
                for (const i in report.reportSchema.tables) {
                    if (report.reportSchema.tables[i].columns) {
                        const tableColumns = [];
                        for (const c in report.reportSchema.tables[i].columns) {
                            tableColumns.push({
                                name: c,
                                dataType: report.reportSchema.tables[i].columns[c]
                            });
                        }
                        tables.push({
                            name: report.reportSchema.tables[i].name,
                            columns: tableColumns
                        });
                    } else {
                        tables.push({
                            name: report.reportSchema.tables[i].name,
                            columns: columns
                        });
                    }
                }
            } else {
                tables.push({
                    name: name,
                    columns: columns
                });
            }

            this.httpService.post(
                `https://api.powerbi.com/v1.0/myorg/groups/${groupId}/datasets`,
                {
                    name: name,
                    defaultMode: 'Push',
                    tables: tables
                },
                { headers }
            ).subscribe({
                next: (response) => {
                    if (response.data.error) {
                        return reject(response.data);
                    }
                    resolve(response.data);
                },
                error: (err) => {
                    reject(err);
                }
            });
        });
    }

    private async rebindReport(accessToken: string, report: any): Promise<boolean> {
        Logger.debug('rebindReport');

        const headers = {
            'Authorization': `Bearer ${accessToken}`
        };

        const url = `https://api.powerbi.com/v1.0/myorg/groups/${report.groupId}/reports/${report.reportId}/Rebind`;
        const data = {
            datasetId: report.datasetId
        };

        try {
            const response = await lastValueFrom(this.httpService.post(url, data, { headers }));
            return response.status === 200;
        } catch (err) {
            Logger.error('Failed to rebind report', err);
            throw err;
        }
    }

    private dateTimeReviver(key: string, value: any): any {
        if (typeof value === 'string') {
            const a = /ISODate\(\\*"([\.0-9T:+-]*)\\*"\)/.exec(value);
            if (a) {
                return new Date(a[1]);
            }
        }
        return value;
    }

    private async getData(id: string, exportDir: string, wb: Workbook, sh: any): Promise<void> {
        const data = await this.usersRepository.findById(
            id, undefined, { populate: { path: 'subjects', populate: { path: 'topics' } } }
        );

        await this.writeToText(data, exportDir);
        await this.writeToXml(data, exportDir);
        await this.writeToTopicsJson(data, exportDir, wb, sh);
    }

    private async writeToGradesJson(id: string, exportDir: string): Promise<void> {
        const data = await this.usersRepository.findById(id);
        const json = JSON.stringify(data, replacer)
            .replace(new RegExp('"@s@', 'g'), "ObjectId('")
            .replace(new RegExp('@e@"', 'g'), "')");
        await fs.promises.writeFile(path.join(exportDir, 'grades.json'), json, { encoding: 'utf8', flag: 'w' });
        Logger.debug('completed..');
    }

    private async writeToSubjectsJson(id: string, exportDir: string): Promise<void> {
        const data = await this.subjectRepository.find({ grade: id });
        let toWrite = '';
        for (const item of data) {
            let json = JSON.stringify(item, replacer)
                .replace(new RegExp('"@s@', 'g'), "ObjectId('")
                .replace(new RegExp('@e@"', 'g'), "')");
            toWrite += json;
        }
        await fs.promises.writeFile(path.join(exportDir, 'subjects.json'), toWrite, { encoding: 'utf8', flag: 'w' });
    }

    private async writeToTopicsJson(data: any, exportDir: string, wb: Workbook, sh: any): Promise<void> {
        let toWrite = '';
        for (const subject of data.subjects) {
            for (const topic of subject.topics) {
                let json = JSON.stringify(topic, replacer)
                    .replace(new RegExp('"@s@', 'g'), "ObjectId('")
                    .replace(new RegExp('@e@"', 'g'), "')");
                toWrite += json;
            }
        }
        await fsExtra.appendFile(path.join(exportDir, 'topics.json'), toWrite);

        const reColumns = [
            { header: 'countryCode', key: 'coun' },
            { header: 'Grade', key: 'gra' },
            { header: 'Subject', key: 'sub' },
            { header: 'Topic', key: 'top' },
        ];
        sh.columns = reColumns;
        sh.getRow(1).font = { bold: true };

        for (const subject of data.subjects) {
            for (const topic of subject.topics) {
                sh.addRow([data.countryCode, data.name, subject.name, topic.name]);
            }
        }

        await wb.xlsx.writeFile(path.join(exportDir, `${data.name}.xlsx`));
        Logger.debug('done');

        zipper.zip(exportDir, (error, zipped) => {
            if (error) throw error;

            const downloadPath = path.join(exportDir, `${data._id}.zip`);
            const sourceFile = `download/wordTemplate/${data._id}/${data._id}.zip`;

            zipped.compress();
            zipped.save(downloadPath, (err) => {
                if (err) throw err;
                Logger.debug('saved successfully!');
            });
        });
    }

    private async writeToXml(data: any, exportDir: string): Promise<void> {
        const ws = fs.createWriteStream(path.join(exportDir, `${data.name}.xml`));
        const xw = new XMLWriter(false, (string, encoding) => {
            ws.write(string, encoding);
        });
        xw.startDocument('1.0', 'UTF-8');
        xw.startElement('perfectice')
            .startElement('country').writeAttribute('name', data.countryCode)
            .startElement('examination').writeAttribute('name', data.name);

        for (const subject of data.subjects) {
            xw.startElement('subject').writeAttribute('name', subject.name);
            for (const topic of subject.topics) {
                xw.startElement('topic').writeAttribute('name', topic.name).endElement();
            }
            xw.endElement();
        }
        xw.endElement().endElement().endElement();
    }

    private async writeToText(data: any, exportDir: string): Promise<void> {
        let toWrite = `
            Option Explicit
            Public Type ProfileLink
                ProfileLinkCode() As String
                ProfileLinkTitle() As String
            End Type

            Function LoadCountryTable() As ProfileLink
                Dim d As String
                d = "1_1"
                LoadCountryTable.ProfileLinkCode = Split(d, ",")
                d = ""
                d = d + "${data.countryCode}"
                LoadCountryTable.ProfileLinkTitle = Split(d, "|")
            End Function

            Function LoadExamTable() As ProfileLink
                Dim d As String
                d = "1_${data.subjects.length}"
                LoadExamTable.ProfileLinkCode = Split(d, ",")
                d = ""
                d = d + "${data.name}"
                LoadExamTable.ProfileLinkTitle = Split(d, "|")
            End Function

            Function LoadSubjectTable() As ProfileLink
                Dim d As String
            `;

        const s = [];
        const t = [];
        const nt = [];
        let count = 1;

        for (const subject of data.subjects) {
            s.push(subject.name);
            nt.push(subject.topics.length);
            for (const topic of subject.topics) {
                t.push(topic.name);
            }
        }

        for (let k = 0; k < nt.length; k++) {
            if (k === 0) {
                toWrite += '\td = "';
            }
            toWrite += count + '_' + (count + nt[k] - 1);
            count += nt[k];
            if (k !== nt.length - 1) {
                toWrite += ',';
            }
            if (k === nt.length - 1) {
                toWrite += '"\n';
            }
        }

        toWrite += "\tLoadSubjectTable.ProfileLinkCode = Split(d, \",\")\n";
        toWrite += "\td =\"\"\n";

        for (let j = 0; j < s.length; j++) {
            if (j % 6 === 0 && j === 0) {
                toWrite += '\td = d + "';
            }
            if (j % 6 === 0 && j !== 0) {
                toWrite += '"\n\td = d + "';
            }
            toWrite += s[j] + '|';
            if (j === s.length - 1) {
                toWrite += '"';
            }
        }

        toWrite += '\n\n';
        toWrite += "\tLoadSubjectTable.ProfileLinkTitle = Split(d, \"|\")\n";
        toWrite += "End Function\n";
        toWrite += "Function LoadTopic() As String()\n";
        toWrite += "\tDim d As String\n";

        for (let k = 0; k < t.length; k++) {
            if (k % 6 === 0 && k === 0) {
                toWrite += '\td = d + "';
            }
            if (k % 6 === 0 && k !== 0) {
                toWrite += '"\n\td = d + "';
            }
            toWrite += t[k] + '|';
            if (k === t.length - 1) {
                toWrite += '"\n';
            }
        }
        toWrite += "\tLoadTopic = Split(d, \"|\")\n";
        toWrite += "End Function\n";

        await fsExtra.appendFile(path.join(exportDir, `${data.name}.txt`), toWrite);
    }
    // Internal Functions - end



    async exportExamDataWordTemplate(request: ExportExamDataWordTemplateReq): Promise<any> {
        try {
            const { _id, query, instancekey } = request;
            const uploadPath = getAssets(instancekey);
            if (query.deleteUrl) {
                const filePath = path.join(uploadPath, query.deleteUrl);
                await fsExtra.remove(filePath);
                return { message: "ok" };
            }
            else {
                const objectId = new ObjectId(_id);

                const defaultPath = path.join(uploadPath, 'download');
                await fsExtra.mkdirp(defaultPath);

                const uploadDir = path.join(defaultPath, 'wordTemplate');
                await fsExtra.mkdirp(uploadDir);

                const exportDir = path.join(uploadDir, `${_id}/`);
                await fsExtra.mkdirp(exportDir);

                const wb = new Workbook();
                const sh = wb.addWorksheet('my sheet');

                // Call your custom functions (implement these according to your logic)
                await this.writeToGradesJson(_id, exportDir);
                await this.writeToSubjectsJson(_id, exportDir);
                await this.getData(_id, exportDir, wb, sh);
            }
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async getReportData(request: GetReportDataReq): Promise<any> {
        try {
            const { query, instancekey, api } = request;

            const REPORT_API_URL = config.reportApi;
            let url = `${REPORT_API_URL}${api}`;

            if (query) {
                const queryString = new URLSearchParams(query as any).toString();
                if (queryString) {
                    url += `?${queryString}`;
                }
            }

            if (query.directDownload) {
                url += url.includes('?') ? '&direct_download=true' : '?direct_download=true';

                const response: AxiosResponse<any> = await firstValueFrom(
                    this.httpService.get(url, {
                        headers: { 'instancekey': instancekey }
                    }).pipe(
                        catchError((error: AxiosError) => {
                            Logger.error(`Request failed with status code ${error.response?.status}`);
                            Logger.error(`Error data: ${JSON.stringify(error.response?.data)}`);
                            throw new Error(`Failed to fetch data from report API: ${JSON.stringify(error.response?.data, null, 2)}`);
                        })
                    )
                );

                return { data: response.data };
            } else {
                const response: AxiosResponse<any> = await firstValueFrom(
                    this.httpService.get(url, {
                        headers: { 'instancekey': instancekey }
                    }).pipe(
                        catchError((error: AxiosError) => {
                            Logger.error(`Request failed with status code ${error}`);
                            Logger.error(`Error data: ${JSON.stringify(error.response?.data)}`);
                            throw new Error(`Failed to fetch data from report API: ${JSON.stringify(error.response?.data, null, 2)}`);
                        })
                    )
                );

                if (response.status !== 200) {
                    return { data: [], msg: response.data?.message || 'Error occurred' };
                }

                if (query?.download) {
                    const dl = `${REPORT_API_URL}/exports/${response.data.data}`;
                    return { downloadLink: dl };
                }

                return { data: response.data };
            }

        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async getReports(request: GetReportsReq): Promise<any> {
        try {
            const { query, instancekey, user } = request;

            let filter: any = { active: true, roles: { $in: user.roles } };

            if (query.subject) {
                filter.subject = query.subject;
            }

            if (query.classroom) {
                filter.classroom = query.classroom;
            }

            if (query.text) {
                filter.name = { "$regex": query.text, $options: 'i' };
            }

            this.reportRepository.setInstanceKey(instancekey);
            const reports = await this.reportRepository.find(filter, undefined, { sort: { 'createdAt': -1 } });

            return { reports: reports };
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async getReport(request: GetReportReq): Promise<any> {
        try {
            const { _id, instancekey } = request;

            this.reportRepository.setInstanceKey(instancekey);
            const report = await this.reportRepository.findById(_id);
            if (!report) {
                return { statusCode: 404 }
            }
            return report;
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async getPowerBIEmbedToken(request: GetPowerBIEmbedTokenReq): Promise<any> {
        try {
            const { _id, instancekey } = request;
            this.reportRepository.setInstanceKey(instancekey);
            const report: any = await this.reportRepository.findById(_id);

            if (!report) {
                return { statusCode: 404 }
            }

            if (!report.reportId) {
                return { statusCode: 404, message: 'PowerBI report is not ready' }
            }

            let reportSection: any = null;
            try {
                reportSection = await this.applyReportFilter(request, report);

                if (reportSection === false) {
                    return { statusCode: 404, message: 'No data found for this report' }
                }
            } catch (err) {
                Logger.error(err);
                if (err.body && err.body.message) {
                    if (err.body.message === 'The gradeId does not exist') {
                        return { statusCode: 404, message: 'No data found for selected grade.' }
                    }
                    Logger.warn("No data found for this report: " + err.body.message);
                    return { statusCode: 404, message: 'No data found for this report.' }
                } else if (err.msg) {
                    return {
                        statusCode: 404, message: err.ms
                    }
                }
            }

            const savedData: any = await this.redisCache.globalGetAsync(instancekey + '_powerBI_' + report.reportId);
            if (savedData) {
                return { statusCode: 200, report: report, token: savedData.token, page: reportSection };
            }

            const accessToken = await this.getADDAccessToken(request.instancekey);

            const groupId = report.groupId;
            const reportId = report.reportId;
            const url = `https://api.powerbi.com/v1.0/myorg/groups/${groupId}/reports/${reportId}/GenerateToken`;

            const headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Bearer ${accessToken}`,
            };

            const formData = {
                accessLevel: 'View',
            };

            const result = await this.httpService.post(url, formData, { headers }).toPromise();
            const bodyObj = result.data;

            if (bodyObj.error) {
                Logger.error(bodyObj);
                return { statusCode: 404, message: 'Failed to generate token' }
            }

            const data: any = { report: report, token: bodyObj.token };
            if (reportSection) {
                data.page = reportSection;
            }

            await this.redisCache.globalSetex(instancekey + '_powerBI_' + report.reportId, { token: bodyObj.token }, 50 * 60);

            return data;
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async downloadReport(request: GetPowerBIEmbedTokenReq): Promise<any> {
        try {
            const { _id, query, instancekey } = request;

            this.reportRepository.setInstanceKey(instancekey);
            const report = await this.reportRepository.findById(_id);
            if (!report) {
                return { statusCode: 404 }
            }

            const queryString = this.buildReportQueryString(query, true);
            let url = `${config.reportApi}${report.reportAPI}?${queryString}`;

            if (query.directDownload) {
                url += '&direct_download=true';
                const response = await lastValueFrom(
                    this.httpService.get(url, {
                        headers: { 'instancekey': instancekey },
                    }).pipe(
                        catchError((error: AxiosError) => {
                            throw new Error(`Failed to fetch data from report API: ${JSON.stringify(error.response?.data, null, 2)}`);
                        })
                    )
                );
                return { response: response.data };
            } else {
                const response = await lastValueFrom(
                    this.httpService.get(url, {
                        headers: { 'instancekey': instancekey },
                    }).pipe(
                        catchError((error: AxiosError) => {
                            throw new Error(`Failed to fetch data from report API: ${JSON.stringify(error.response?.data, null, 2)}`);
                        })
                    )
                );
                const reportData = response.data;

                if (response.status !== 200) {
                    if (reportData.message) {
                        return { statusCode: 404, message: reportData.message }

                    }
                    return { statusCode: 404 }
                }
                const dl = `${config.reportApi}exports/${reportData.data}`;
                return { downloadLink: dl };
            }
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async downloadPsychoReport(request: GetPowerBIEmbedTokenReq): Promise<any> {
        try {
            const { _id, query, instancekey } = request;
            let url = `${config.reportApi}downloadStudentPersonalityResultByTest?testId=${_id}`;

            if (query.classrooms) {
                url += `&classIds=${query.classrooms}`;
            }

            if (query.directDownload) {
                url += '&direct_download=true';

                const response = await lastValueFrom(
                    this.httpService.get(url, {
                        headers: { 'instancekey': instancekey }
                    }).pipe(
                        catchError((error: AxiosError) => {
                            throw new Error(`Failed to fetch data from report API: ${JSON.stringify(error.response?.data, null, 2)}`);
                        })
                    )
                );

                return { statusCode: 200, response: response.data };
            } else {
                const response = await lastValueFrom(
                    this.httpService.get(url, {
                        headers: { 'instancekey': instancekey }
                    }).pipe(
                        catchError((error: AxiosError) => {
                            throw new Error(`Failed to fetch data from report API: ${JSON.stringify(error.response?.data, null, 2)}`);
                        })
                    )
                );
                const reportData = response.data;

                if (response.status !== 200) {
                    if (reportData.message) {
                        return { statusCode: 404, message: reportData.message };
                    }
                    return { statusCode: 404 };
                }

                const dl = `${config.reportApi}exports/${reportData.data}`;
                return { statusCode: 200, downloadLink: dl };
            }
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async getMailTemplates(request: GetMailTemplatesReq): Promise<any> {
        try {
            const { query, instancekey } = request;

            let filter: any = {};
            if (query.type === 'transactional') {
                filter.dataSource = null;
            }

            this.notificationTemplateRepository.setInstanceKey(instancekey);
            const templates = await this.notificationTemplateRepository.find(filter);
            return { statusCode: 200, templates };
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async sendBulkMail(request: SendBulkMailReq): Promise<any> {
        try {
            if (!request.body.key) {
                return { statusCode: 400, message: 'Key is missing' };
            }

            const dataMsgCenter = {
                modelId: 'bulkMail',
                isScheduled: true,
            };

            const result = await this.messageCenter.sendUsingSource(request.instancekey, request.body, dataMsgCenter);

            return { statusCode: 200, result: result };
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async runBulkMailDataSource(request: RunBulkMailDataSourceReq): Promise<any> {
        try {
            let queryStr = JSON.stringify(request.body).replace(/@@/g, '$');
            let query = JSON.parse(queryStr, this.dateTimeReviver);

            if (!request.user.roles.includes('admin')) {
                query.unshift({
                    $match: { locations: new ObjectId(request.user.activeLocation) }
                });
            }

            this.usersRepository.setInstanceKey(request.instancekey);
            if (request.query.statistic) {
                query.push(
                    {
                        $lookup: {
                            from: 'users',
                            localField: '_id',
                            foreignField: '_id',
                            as: 'extraUserData'
                        }
                    },
                    {
                        $unwind: '$extraUserData'
                    },
                    {
                        $group: {
                            _id: null,
                            email: { $sum: { $cond: [{ $ne: ['$extraUserData.email', null] }, 1, 0] } },
                            phone: { $sum: { $cond: [{ $and: [{ $eq: ['$extraUserData.email', null] }, { $ne: ['$extraUserData.phoneNumber', null] }] }, 1, 0] } }
                        }
                    }
                );

                const result: any = await this.usersRepository.aggregate(query);

                return {
                    email: result[0] ? result[0].email : 0,
                    phone: result[0] ? result[0].phone : 0
                };
            }

            // all data source must return _id of user, email and phone number
            const result = await this.usersRepository.aggregate(query);

            return { result: result };
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async updateBulkMail(request: UpdateBulkMailReq): Promise<any> {
        try {
            this.notificationTemplateRepository.setInstanceKey(request.instancekey);
            await this.notificationTemplateRepository.updateOne(
                { _id: request._id },
                {
                    $set: {
                        note: request.note,
                        subject: request.subject,
                        preheader: request.preheader,
                        body: request.body,
                        sms: request.sms,
                        dataSource: request.dataSource,
                        tags: request.tags,
                        schedule: request.schedule,
                    },
                }
            )

            return { statusCode: 200, message: 'ok' };
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async testBulkMail(request: TestBulkMailReq): Promise<any> {
        try {
            const dataMsgCenter = {
                modelId: 'bulkMail',
                isScheduled: true
            };

            await this.messageCenter.buildMail(request, dataMsgCenter);

            return { statusCode: 200, message: 'ok' };
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async testMailByKey(request: TestMailByKeyReq): Promise<any> {
        try {
            if (!request._id) {
                return { statusCode: 400, message: 'Key is missing' };
            }

            const dataMsgCenter = {
                receiver: request.user._id,
                modelId: 'testMail',
                sender: request.user._id,
                to: request.user.userId,
                isEmail: isEmail(request.user.userId),
                isScheduled: true,
                isSent: false
            };

            await this.messageCenter.sendWithTemplate(request, request._id, request.body, dataMsgCenter);

            return { statusCode: 200, message: 'ok' };
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async sendRemindProctoredTestMail(request: TestMailByKeyReq): Promise<any> {
        try {
            this.classroomRepository.setInstanceKey(request.instancekey);
            this.usersRepository.setInstanceKey(request.instancekey);
            const classroom = await this.classroomRepository.findById(request._id)

            if (!request._id) {
                return { statusCode: 404, message: 'classroom not found!' };
            }

            for (const student of classroom.students) {
                const user = await this.usersRepository.findById(student.studentId, "userId name");
                if (!user) {
                    continue;
                }

                const options = { ...request.body, userId: user.userId, user_name: user.name };
                const dataMsgCenter = {
                    receiver: user._id,
                    modelId: 'bulkMail',
                    sender: request.user._id,
                    to: user.userId,
                    isEmail: isEmail(user.userId),
                    isScheduled: true,
                    isSent: false,
                };

                await this.messageCenter.sendWithTemplate(request, 'remind-proctored-test', options, dataMsgCenter);
            }

            return { statusCode: 200, message: 'ok' };
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async uploadCampaignMailSource(request: UploadCampaignMailSourceReq): Promise<any> {
        try {
            const { file } = request;
            if (!file) {
                throw new BadRequestException('No file passed');
            }

            const template = await this.notificationTemplateRepository.findOne({ _id: request._id });
            if (!template) {
                throw new NotFoundException('Notification template not found');
            }
            const workbook = xlsx.read(file.buffer, { type: 'buffer' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const rows: any[] = xlsx.utils.sheet_to_json(worksheet, { raw: true });

            this.practiceSetRepository.setInstanceKey(request.instancekey);
            const users = [];
            let emailCount = 0;
            let phoneCount = 0;

            for (const row of rows) {
                const user: any = { data: {} };
                if (!row.user) {
                    throw new BadRequestException({ msg: 'Missing User column!' });
                } else {
                    if (ObjectId.isValid(row.user)) {
                        const fu = await this.usersRepository.findOne({ _id: row.user });
                        if (fu) {
                            user._id = fu._id;
                            user.email = fu.email;
                            if (fu.phoneNumber && fu.country && fu.country.callingCodes.length) {
                                user.phoneNumber = fu.country.callingCodes[0] + fu.phoneNumber;
                            }
                        } else {
                            throw new NotFoundException({ msg: `User ${row.user} not found!` });
                        }
                    } else {
                        if (isEmail(row.user)) {
                            user.email = row.user;
                        } else {
                            user.phoneNumber = row.user;
                        }
                    }
                }

                if (user.email) {
                    emailCount++;
                } else if (user.phoneNumber) {
                    phoneCount++;
                }

                for (const tag of template.tags) {
                    if (row[tag] === undefined) {
                        throw new BadRequestException({ msg: `Missing ${tag} column!` });
                    } else {
                        user.data[tag] = row[tag];
                    }
                }
                users.push(user);
            }

            template.uploadedSource = {
                name: file.originalname,
                users,
            };

            await this.notificationTemplateRepository.findByIdAndUpdate(request._id, { uploadedSource: template.uploadedSource });

            return { name: file.originalname, email: emailCount, phone: phoneCount };
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw new GrpcInvalidArgumentException(error.getResponse());
            }
            if (error instanceof NotFoundException) {
                throw new GrpcNotFoundException(error.getResponse());
            }
            throw new GrpcInternalException(error.message);
        }
    }

    async removeCampaignMailUploadedSource(request: GetReportReq): Promise<any> {
        try {
            this.notificationTemplateRepository.setInstanceKey(request.instancekey);
            await this.notificationTemplateRepository.updateOne(
                { _id: request._id },
                { $unset: { uploadedSource: false } }
            );

            return { statusCode: 200, message: 'ok' };
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async getProgramOutcomes(request: GetProgramOutcomesReq): Promise<any> {
        try {
            this.programOutcomeRepository.setInstanceKey(request.instancekey);
            const programs = await this.programOutcomeRepository.find({}, null, {lean: true});

            return { statusCode: 200, programs: programs };
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async createProgramOutcome(request: CreateProgramOutcomeReq): Promise<any> {
        try {
            const condition = { codeLower: request.code.trim().toLowerCase() };
            this.programOutcomeRepository.setInstanceKey(request.instancekey);
            const existingOutcome = await this.programOutcomeRepository.findOne(condition);

            if (existingOutcome) {
                return { statusCode: 400, msg: 'Program outcome already exists' };
            }

            const data = {
                code: request.code,
                description: request.description,
                codeLower: request.code.trim().toLowerCase(),
            };

            const program = await this.programOutcomeRepository.create(data);
            return { statusCode: 200, response: program };
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async updateProgramOutcome(request: UpdateProgramOutcomeReq): Promise<any> {
        try {
            const condition = { _id: request._id };
            this.programOutcomeRepository.setInstanceKey(request.instancekey);
            const existingOutcome = await this.programOutcomeRepository.findOne(condition);
            if (existingOutcome) {
                if (request.code) {
                    existingOutcome.code = request.code;
                }
                if (request.description) {
                    existingOutcome.description = request.description;
                }
                const program = await this.programOutcomeRepository.updateOne(
                    { _id: request._id }, existingOutcome
                );
                return { statusCode: 200, response: program };
            }
            else {
                return { statusCode: 400, msg: 'no record found' };
            }
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async deleteProgramOutcome(request: DeleteProgramOutcomeReq): Promise<any> {
        try {
            this.programOutcomeRepository.setInstanceKey(request.instancekey);
            const existingOutcome = await this.programOutcomeRepository.findOne({ _id: request._id });
            if (existingOutcome) {
                if (request.query.active) {
                    existingOutcome.active = request.query.active;
                }
                else {
                    existingOutcome.active = false;
                }
                const program = await this.programOutcomeRepository.updateOne(
                    { _id: request._id }, existingOutcome
                );
                return { statusCode: 200, response: program };
            }
            else {
                return { statusCode: 400, msg: 'no record found' };
            }
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async getCourses(request: GetProgramOutcomesReq): Promise<any> {
        try {
            const condition = { status: { $nin: ['archived'] } };
            this.accreditationCoursesRepository.setInstanceKey(request.instancekey);
            const results = await this.accreditationCoursesRepository.find(condition, null, {
                sort: { active: -1, createdAt: -1 }, lean: true,
            });

            return { results: results };
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async createCourse(request: CreateCourseReq): Promise<any> {
        try {
            const condition = { codeLower: request.code.trim().toLowerCase() };

            this.accreditationCoursesRepository.setInstanceKey(request.instancekey);
            const exist = await this.accreditationCoursesRepository.findOne(condition);
            if (exist) {
                return { statusCode: 500, msg: "Course already exists" }
            }

            const data = {
                subject: new Types.ObjectId(request.subject),
                code: request.code,
                name: request.name,
                definition: request.definition,
                evaluations: request.evaluations,
                outcomes: request.outcomes,
                fileName: request.fileName,
                feedback: request.feedback,
            };

            const result = await this.accreditationCoursesRepository.create(data);
            return { statusCode: 200, response: result }
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async updateCourse(request: UpdateCourseReq): Promise<any> {
        try {
            const condition = { _id: request._id };
            this.accreditationCoursesRepository.setInstanceKey(request.instancekey);
            const exist = await this.accreditationCoursesRepository.findOne(condition);

            if (!exist) {
                return { statusCode: 500, msg: "No record found" }
            }

            Object.assign(exist, request);

            const result = await this.accreditationCoursesRepository.updateOne({ _id: request._id }, exist);

            return { statusCode: 200, response: result };
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async deleteCourse(request: DeleteCourseReq): Promise<any> {
        try {
            this.accreditationCoursesRepository.setInstanceKey(request.instancekey);
            const result = await this.accreditationCoursesRepository.findOne({ _id: request._id });

            if (!result) {
                return { statusCode: 500, msg: "No record found" }
            }

            if (result.status === 'draft') {
                await this.accreditationCoursesRepository.findByIdAndDelete(request._id);
            } else {
                result.status = 'archived';
                await this.accreditationCoursesRepository.updateOne({ _id: request._id }, result);
            }

            return { response: result };
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async getEvaluations(request: GetProgramOutcomesReq): Promise<any> {
        try {
            this.accreditationEvaluationsRepository.setInstanceKey(request.instancekey);
            const evaluations = await this.accreditationEvaluationsRepository.find({});

            return { statusCode: 200, results: evaluations };
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async createEvaluation(request: CreateEvaluationReq): Promise<any> {
        try {
            const condition = { codeLower: request.code.trim().toLowerCase() };

            this.accreditationEvaluationsRepository.setInstanceKey(request.instancekey);
            const exist = await this.accreditationEvaluationsRepository.findOne(condition);
            if (exist) {
                return { statusCode: 500, msg: "Evaluation already exists" }
            }

            const data = {
                code: request.code,
                type: request.type,
                category: request.category,
                mode: request.mode,
                questions: request.questions,
                codeLower: request.code.trim().toLowerCase(),
            };

            const result = await this.accreditationEvaluationsRepository.create(data);
            return { statusCode: 200, response: result }
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async updateEvaluation(request: UpdateEvaluationReq): Promise<any> {
        try {
            const condition = { _id: request._id };
            this.accreditationEvaluationsRepository.setInstanceKey(request.instancekey);
            const exist = await this.accreditationEvaluationsRepository.findOne(condition);

            if (!exist) {
                return { statusCode: 500, msg: "No record found" }
            }

            Object.assign(exist, request);

            const result = await this.accreditationEvaluationsRepository.updateOne({ _id: request._id }, exist);

            return { statusCode: 200, response: result };
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async deleteEvaluation(request: DeleteEvaluationReq): Promise<any> {
        try {
            this.accreditationEvaluationsRepository.setInstanceKey(request.instancekey);
            const result = await this.accreditationEvaluationsRepository.findOne({ _id: request._id });

            if (!result) {
                return { statusCode: 500, msg: "No record found" }
            }

            result.active = !!request.query.active;
            await this.accreditationEvaluationsRepository.updateOne({ _id: request._id }, result);

            return { response: result };
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async getAccreditationSettings(request: GetAccreditationSettingsReq): Promise<any> {
        try {
            this.accreditationSettingsRepository.setInstanceKey(request.instancekey);
            const settings = await this.accreditationSettingsRepository.findOne({}, null, { lean: true });

            return { ...settings };
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async updateAccreditationSetting(request: UpdateAccSettingReq): Promise<any> {
        try {
            this.accreditationSettingsRepository.setInstanceKey(request.instancekey);
            const result = await this.accreditationSettingsRepository.findOne({ _id: request._id });
            if (!result) {
                return { statusCode: 500, msg: "No record found" }
            }

            // Update fields if they are not undefined
            if (request.targetLevel !== undefined) {
                result.targetLevel = request.targetLevel;
            }
            if (request.directFactor !== undefined) {
                result.directFactor = request.directFactor;
            }
            if (request.indirectFactor !== undefined) {
                result.indirectFactor = request.indirectFactor;
            }
            if (request.minStudentMarks !== undefined) {
                result.minStudentMarks = request.minStudentMarks;
            }
            result.updatedAt = new Date();

            const results = await this.accreditationSettingsRepository.updateOne({ _id: request._id }, result);

            return { statusCode: 200, response: results };
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async getAccreditationReports(request: GetAccReportReq): Promise<any> {
        try {
            this.accreditationReportsRepository.setInstanceKey(request.instancekey);
            const reports = await this.accreditationReportsRepository.find({
                active: true, roles: { $in: request.user.roles }
            });

            return { statusCode: 200, results: reports };
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async getAccreditationAttainments(request: GetAccAttReq): Promise<any> {
        try {
            this.accreditationAttainmentsRepository.setInstanceKey(request.instancekey);
            const result = await this.accreditationAttainmentsRepository.findOne({
                course: request.code, active: true
            });

            if (!result) {
                return { statusCode: 500, message: "No record found" }
            }

            return { statusCode: 200, response: result };
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async teacherByExam(request: GetReportReq): Promise<any> {
        try {
            this.usersRepository.setInstanceKey(request.instancekey);
            const teacherList = await this.usersRepository.find(
                { subjects: new Types.ObjectId(request._id), roles: { $in: ['teacher'] } },
                { name: 1 },
                { sort: { name: 1 }, lean: true }
            );

            return { statusCode: 200, teacherList: teacherList };
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async mapTestToClassroom(request: MapTestToClassroomReq): Promise<any> {
        const { file } = request;
        try {
            if (!file) {
                throw new BadRequestException('No file passed');
            }

            const workbook = xlsx.read(file.buffer, { type: 'buffer' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const rows: any = xlsx.utils.sheet_to_json(worksheet, { raw: true });

            this.practiceSetRepository.setInstanceKey(request.instancekey);
            this.classroomRepository.setInstanceKey(request.instancekey);
            const summary: any = {
                testCount: 0,
                classroomCount: 0,
                error: []
            };

            for (const row of rows) {
                if (!row.assessment || !row.classrooms) {
                    throw new BadRequestException({ msg: 'Invalid format!' });
                }

                let query: any = { _id: row.assessment };
                if (!ObjectId.isValid(row.assessment)) {
                    query = { title: new RegExp(["^", escapeRegex(row.assessment), "$"].join(""), "i") };
                }

                const test = await this.practiceSetRepository.findOne(query);
                if (!test || test.accessMode != 'invitation') {
                    summary.error.push('Test ' + row.assessment + ' not found!');
                    continue;
                }

                const cIds = row.classrooms.split(',');

                for (const cId of cIds) {
                    let classQuery: any = { _id: cId };
                    if (!ObjectId.isValid(cId)) {
                        classQuery = { name: new RegExp(["^", escapeRegex(cId), "$"].join(""), "i") };
                    } else {
                        if (test.classRooms.includes(cId)) {
                            continue;
                        }
                    }

                    const classroom = await this.classroomRepository.findOne(classQuery, 'location');
                    if (!classroom) {
                        summary.error.push('Classroom ' + cId + ' not found!');
                        continue;
                    }

                    if (classroom.location && !test.locations.includes(classroom.location)) {
                        test.locations.push(classroom.location);
                    }

                    summary.classroomCount++;
                    test.classRooms.push(classroom._id);
                }

                summary.testCount++;
                await this.practiceSetRepository.findByIdAndUpdate(test._id, { $set: { classRooms: test.classRooms, locations: test.locations } });
            }

            return summary;
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw new GrpcInvalidArgumentException(error.getResponse());
            }
            throw new GrpcInternalException(error.message);
        }
    }

    async getNews(request: GetNewsReq): Promise<any> {
        try {
            this.newsRepository.setInstanceKey(request.instancekey);
            const limit = Number(request.query.limit || 10);
            const skip = Number(request.query.skip || 0);

            let searchQuery: any = {};
            if (request.query.searchText) {
                searchQuery.title = { $regex: escapeRegex(request.query.searchText), $options: "i" };
            }
            if (!request.user.roles.includes('admin')) {
                searchQuery.active = true;
            }
            const results = await this.newsRepository.find(
                searchQuery, {}, { sort: { status: 1, updatedAt: -1 }, skip, limit }
            );

            return { statusCode: 200, results: results };
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async createNews(request: CreateNewsReq): Promise<any> {
        try {
            if (!request.title || !request.imageUrl) {
                return { statusCode: 400, message: 'Missing title or image.' }
            }
            const data = {
                user: new Types.ObjectId(request.user._id),
                title: request.title,
                description: request.description,
                link: request.link,
                imageUrl: request.imageUrl,
                active: true,
            };

            this.newsRepository.setInstanceKey(request.instancekey);
            const news = await this.newsRepository.create(data);

            return { statusCode: 200, news: news }
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }

    async updateNews(request: UpdateNewsReq): Promise<any> {
        try {
            this.newsRepository.setInstanceKey(request.instancekey);
            const existingNews = await this.newsRepository.findOne({ _id: request._id });
            if (!existingNews) {
                return { statusCode: 404, message: 'News not found.' }
            }

            const updatedNews = Object.assign(existingNews, request);
            const news = await this.newsRepository.updateOne({ _id: request._id }, updatedNews);

            return { statusCode: 200, news: news };
        } catch (error) {
            throw new GrpcInternalException(error.message);
        }
    }
}