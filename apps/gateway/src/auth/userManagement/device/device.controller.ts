import { Body, Controller, Delete, Get, Param, Post, Query, Req, UseGuards } from "@nestjs/common";
import { ApiHeader, ApiQuery, ApiTags } from "@nestjs/swagger";
import { DeviceService } from "./device.service";
import { InsertDeviceBody } from "@app/common/dto/userManagement/device.dto";
import { AuthenticationGuard } from "@app/common/auth";

@ApiTags('Device')
@Controller('device')
export class DeviceController {
    constructor(private deviceService: DeviceService) {}

    @Post('/register-device-token')
    @ApiHeader({name: 'authtoken'})
    @ApiHeader({name: 'instancekey'})
    @UseGuards(AuthenticationGuard)
    async insertDevice(@Body() request: InsertDeviceBody, @Req() req: any) {
        const combinedData = {
            body: {...request},
            user: req.user
        }
        return this.deviceService.insertDevice(combinedData);
    }

    @Get('/:id/remove-device')
    @ApiHeader({name: 'authtoken'})
    @ApiHeader({name: 'instancekey'})
    @ApiQuery({name: 'devicePlatform', required: false})
    @UseGuards(AuthenticationGuard)
    async removeDevice(@Param('id') id: string, @Query('devicePlatform') devicePlatform: string) {
        const combinedData = {
            id,
            devicePlatform
        }
        return this.deviceService.removeDevice(combinedData);
    }

    @Delete('remove-device/:token')
    @ApiHeader({name: 'authtoken'})
    @ApiHeader({name: 'instancekey'})
    @UseGuards(AuthenticationGuard)
    async removeDeviceToken(@Param('token') token: string, @Req() req: any) {
        const combinedData = {
            token,
            user: req.user
        }
        return this.deviceService.removeDeviceToken(combinedData);
    }

    @Get('getAll')
    @ApiHeader({name: 'instancekey'})
    async getAll() {
        return this.deviceService.getAll({});
    }
}