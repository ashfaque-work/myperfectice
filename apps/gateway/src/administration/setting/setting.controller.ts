import { Body, Controller, Param, Get, Post, Put, Delete, UseGuards, Headers, Req } from '@nestjs/common';
import { Roles } from '@app/common/decorators';
import { AuthenticationGuard, RolesGuard } from '@app/common/auth';
import { ApiTags, ApiHeader, ApiParam } from '@nestjs/swagger';
import { SettingService } from './setting.service';
import { AddAdvertismentImageReq, GetConvertCurrencyReq, GetUpdateRequest, SettingRequest, UpdateSettingRequest } from '@app/common/dto/administration/setting.dto';

@ApiTags('Setting')
@Controller('settings')
export class SettingController {
    constructor(private settingService: SettingService) { }

    @Post('create')
    @ApiHeader({ name: 'authtoken' })
    @ApiHeader({ name: 'instancekey' })
    @Roles(['admin'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    createSetting(@Body() request: SettingRequest, @Headers('instancekey') instancekey: string) {
        const combinedData = {
            ...request,
            instancekey
        }
        return this.settingService.createSetting(combinedData);
    }

    @Get('getCurrentDateTime')
    getCurrentDateTime() {
        return this.settingService.getCurrentDateTime({});
    }

    @Get('codeEngineAddress')
    @ApiHeader({ name: 'authtoken' })
    @UseGuards(AuthenticationGuard)
    getCodeEngineAddress() {
        return this.settingService.getCodeEngineAddress({});
    }

    @Get('getWhiteLabel')
    getWhiteLabel(@Headers('instancekey') instancekey: string) {
        return this.settingService.getWhiteLabel({ instancekey });
    }

    @Get('find/:slugs')
    @ApiParam({ name: 'slugs', required: false })
    findAll(@Param('slugs') slugs?: string) {
        return this.settingService.findAll({ slugs })
    }

    @Get('paymentMethods')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    getPaymentMethods(@Headers('instancekey') instancekey: string, @Req() request: any) {
        return this.settingService.getPaymentMethods({ instancekey, country: request.user.country })
    }

    @Get('instances')
    getAllInstances() {
        return this.settingService.getAllInstances({});
    }

    @Get('webConfig')
    getWebConfig() {
        return this.settingService.getWebConfig({});
    }

    @Get('show')
    show() {
        return this.settingService.show({})
    }

    @Get('/deploymentStatus')
    getDeploymentStatus() {
        return this.settingService.getDeploymentStatus({});
    }


    @Get('/countryByIp')
    getCountryByIp(@Req() req: any, @Headers('instancekey') instancekey: string) {
        return this.settingService.getCountryByIp({ instancekey, ip: req.ip });
    }

    @Get('videoStreaming')
    @ApiHeader({ name: 'authtoken' })
    @UseGuards(AuthenticationGuard)
    getVideoStreaming(@Headers('instancekey') instancekey: string) {
        return this.settingService.getVideoStreaming({ instancekey });
    }

    @Post('/convertCurrency')
    @ApiHeader({ name: 'authtoken', required: true })
    convertCurrency(@Req() req: any, @Body() request: GetConvertCurrencyReq, @Headers('instancekey') instancekey: string) {
        const combinedData = {
            ...request,
            instancekey,
            user: req.user
        }
        // console.log(combinedData)
        return this.settingService.convertCurrency(combinedData);
    } 

    @Get('/:slug')
    @ApiHeader({ name: 'authtoken' })
    @UseGuards(AuthenticationGuard)
    getOneSetting(@Param('slug') slug: string) {
        return this.settingService.getOneSetting({ slug: slug });
    }

    @Put('/')
    @ApiHeader({ name: 'authtoken' })
    @Roles(['admin'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    updateSetting(@Body() request: UpdateSettingRequest) {
        return this.settingService.updateSetting(request);
    }

    @Put('addAdvertismentImage')
    @ApiHeader({ name: 'authtoken' })
    @UseGuards(AuthenticationGuard)
    addAdvertismentImage(@Body() request: AddAdvertismentImageReq) {
        return this.settingService.addAdvertismentImage(request)
    }

    @Put('update')
    @ApiHeader({ name: 'authtoken' })
    @UseGuards(AuthenticationGuard)
    update(@Body() request: GetUpdateRequest, @Headers('instancekey') instancekey: string) {
        const combinedData = {
            ...request,
            instancekey
        }
        return this.settingService.update(combinedData);
    }

    @Delete('/deleteAdvertismentImage/:id')
    @ApiHeader({ name: 'authtoken' })
    @UseGuards(AuthenticationGuard)
    deleteAdvertismentImage(@Param('id') id: string) {
        return this.settingService.deleteAdvertismentImage({ _id: id })
    }

    @Delete('/:id')
    @ApiHeader({ name: 'authtoken' })
    @Roles(['admin'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    deleteSetting(@Param('id') id: string) {
        return this.settingService.deleteSetting({ _id: id });
    }

    @Get('find-one/:slug')
    findOne(@Param('slug') slug?: string) {
        return this.settingService.findOne({ slug });
    }
}
