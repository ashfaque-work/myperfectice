import { Body, Controller, Param, Get, Post, Put, UseGuards, Headers, Query, Req } from '@nestjs/common';
import { Roles } from '@app/common/decorators';
import { AuthenticationGuard, RolesGuard } from '@app/common/auth';
import { ApiTags, ApiHeader, ApiQuery } from '@nestjs/swagger';
import { CouponService } from './coupon.service';
import { CreateCouponsReq, UpdateCouponsReq } from '@app/common/dto/eCommerce';

@ApiTags('Coupon')
@Controller('coupons')
export class CouponController {
    constructor(private couponService: CouponService) { }

    @Get('/findOne/:code')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    findOneCoupon(@Param('code') code: string, @Req() req: any, @Headers('instancekey') instancekey: string) {
        return this.couponService.findOneCoupon({ code, user: req.user, instancekey });
    }

    @Get('/ambassadorCode')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    getAmbassadorCode(@Req() req: any, @Headers('instancekey') instancekey: string) {
        return this.couponService.getAmbassadorCode({ user: req.user, instancekey });
    }

    @Get('/findByItem/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    findByItem(@Param('id') id: string, @Headers('instancekey') instancekey: string) {
        return this.couponService.findByItem({ _id: id, instancekey });
    }

    @Get('/findAvailable')
    @ApiHeader({ name: 'authtoken', required: true })
    @ApiQuery({ name: 'skip', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'items', required: false, type: String })
    @UseGuards(AuthenticationGuard)
    findAvailableCoupons(@Headers('instancekey') instancekey: string, @Req() req: any,
        @Query('skip') skip: number,
        @Query('limit') limit: number,
        @Query('items') items: string,
    ) {
        return this.couponService.findAvailableCoupons(
            { user: req.user, query: { skip, limit, items, }, instancekey }
        );
    }

    @Post('/')
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['teacher', 'operator', 'mentor', 'publisher', 'admin', 'centerHead', 'director'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    createCoupon(@Body() request: CreateCouponsReq, @Req() req: any, @Headers('instancekey') instancekey: string) {
        return this.couponService.createCoupon({ ...request, user: req.user, instancekey });
    }

    @Put('/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @Roles(['student', 'teacher', 'operator', 'mentor', 'publisher', 'admin', 'centerHead', 'director'])
    @UseGuards(AuthenticationGuard, RolesGuard)
    updateCoupon(
        @Param('id') id: string, @Body() request: UpdateCouponsReq,
        @Req() req: any, @Headers('instancekey') instancekey: string) {
        return this.couponService.updateCoupon({ _id: id, user: req.user, instancekey, ...request });
    }
}
