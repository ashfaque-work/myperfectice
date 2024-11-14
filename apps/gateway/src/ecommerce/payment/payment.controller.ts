import { Body, Controller, Param, Get, Post, Put, Headers, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiHeader, ApiQuery } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { CreatePaymentReq, EnrollItemsReq, FinishCCAReq, InitCCAReq, PaymentFinishReq, PaymentResultReq } from '@app/common/dto/eCommerce';
import { AuthenticationGuard } from '@app/common/auth';

@ApiTags('Payment')
@Controller('payments')
export class PaymentController {
    constructor(private paymentService: PaymentService) { }

    @Get('/me')
    @ApiHeader({ name: 'authtoken', required: true })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'sort', required: false, type: String })
    @ApiQuery({ name: 'isReferral', required: false, type: Boolean })
    @ApiQuery({ name: 'id', required: false, type: String })
    @UseGuards(AuthenticationGuard)
    findByMe(
        @Req() req: any, @Headers('instancekey') instancekey: string,
        @Query('page') page: number, @Query('limit') limit: number,
        @Query('sort') sort: string, @Query('isReferral') isReferral: string,
        @Query('id') id: string,
    ) {
        return this.paymentService.findByMe(
            { user: req.user, instancekey, query: { page, limit, sort, isReferral: isReferral === 'true', id } }
        );
    }

    @Get('/me/revenueAll')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    revenueAll(@Req() req: any, @Headers('instancekey') instancekey: string) {
        return this.paymentService.revenueAll({ user: req.user, instancekey });
    }

    @Get('/me/revenueThisMonth')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    revenueThisMonth(@Req() req: any, @Headers('instancekey') instancekey: string) {
        return this.paymentService.revenueThisMonth({ user: req.user, instancekey });
    }

    @Get('/me/revenueToday')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    revenueToday(@Req() req: any, @Headers('instancekey') instancekey: string) {
        return this.paymentService.revenueToday({ user: req.user, instancekey });
    }

    @Get('/me/revenueWeek')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    revenueWeek(@Req() req: any, @Headers('instancekey') instancekey: string) {
        return this.paymentService.revenueWeek({ user: req.user, instancekey });
    }

    @Get('/me/findAllPaymentDetail')
    @ApiHeader({ name: 'authtoken', required: true })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'sort', required: false, type: String })
    @ApiQuery({ name: 'keyword', required: false, type: String })
    @UseGuards(AuthenticationGuard)
    findAllPaymentDetail(
        @Req() req: any, @Headers('instancekey') instancekey: string,
        @Query('page') page: number, @Query('limit') limit: number,
        @Query('sort') sort: string, @Query('keyword') keyword: string,
    ) {
        return this.paymentService.findAllPaymentDetail(
            { user: req.user, instancekey, query: { page, limit, sort, keyword } }
        );
    }

    @Get('/me/countAllPaymentDetail')
    @ApiHeader({ name: 'authtoken', required: true })
    @ApiQuery({ name: 'keyword', required: false, type: String })
    @UseGuards(AuthenticationGuard)
    countAllPaymentDetail(@Req() req: any, @Headers('instancekey') instancekey: string, @Query('keyword') keyword: string) {
        return this.paymentService.countAllPaymentDetail(
            { user: req.user, instancekey, query: { keyword } }
        );
    }

    @Get('/me/lastRevenue')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    lastRevenue(@Req() req: any, @Headers('instancekey') instancekey: string) {
        return this.paymentService.lastRevenue({ user: req.user, instancekey });
    }

    @Get('/me/findOne/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    findOneByMe(@Param('id') id: string, @Req() req: any, @Headers('instancekey') instancekey: string) {
        return this.paymentService.findOneByMe({ _id: id, user: req.user, instancekey });
    }

    @Get('/me/findPaymentDetails/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    findPaymentDetails(@Param('id') id: string, @Req() req: any, @Headers('instancekey') instancekey: string) {
        return this.paymentService.findPaymentDetails({ _id: id, user: req.user, instancekey });
    }

    @Get('/countByMe')
    @ApiHeader({ name: 'authtoken', required: true })
    @ApiQuery({ name: 'isReferral', required: false, type: Boolean })
    @ApiQuery({ name: 'id', required: false, type: String })
    @UseGuards(AuthenticationGuard)
    countByMe(
        @Req() req: any, @Headers('instancekey') instancekey: string, @Query('isReferral') isReferral: string, @Query('id') id: string,
    ) {
        return this.paymentService.countByMe({ user: req.user, instancekey, query: { isReferral: isReferral === 'true', id } });
    }

    @Get('/transaction/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    getTransaction(@Param('id') id: string, @Headers('instancekey') instancekey: string) {
        return this.paymentService.getTransaction({ _id: id, instancekey });
    }  

    @Get('/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    findOnePayment(@Param('id') id: string, @Headers('instancekey') instancekey: string) {
        return this.paymentService.findOnePayment({ _id: id, instancekey });
    }

    @Post('/initCCA')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    initCCA(@Body() request: InitCCAReq, @Req() req: any, @Headers('instancekey') instancekey: string) {
        return this.paymentService.initCCA({ ...request, user: req.user, instancekey });
    }

    @Post('/finishCCA/:id')
    finishCCA(@Param('id') id: string, @Body() request: FinishCCAReq, @Req() req: any, @Headers('instancekey') instancekey: string) {
        return this.paymentService.finishCCA({ ...request, _id: id, user: req.user, instancekey });
    }

    @Post('/cancelCCA/:id')
    cancelCCA(@Param('id') id: string, @Headers('instancekey') instancekey: string) {
        return this.paymentService.cancelCCA({ _id: id, instancekey });
    }

    @Post('/enrollItems')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    enrollItems(@Body() request: EnrollItemsReq, @Req() req: any, @Headers('instancekey') instancekey: string) {
        return this.paymentService.enrollItems({ ...request, user: req.user, instancekey });
    }

    @Post('/')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    createPayment(@Body() request: CreatePaymentReq, @Req() req: any, @Headers('instancekey') instancekey: string) {
        return this.paymentService.createPayment({ ...request, user: req.user, instancekey });
    }

    @Post('/paymentResult/:id')
    paymentResult(@Param('id') id: string, @Body() request: PaymentResultReq, @Req() req: any, @Headers('instancekey') instancekey: string) {
        return this.paymentService.paymentResult({ ...request, _id: id, user: req.user, instancekey });
    }

    @Post('/paymentFinish/:id')
    @ApiHeader({ name: 'authtoken', required: true })
    @UseGuards(AuthenticationGuard)
    paymentFinish(@Param('id') id: string, @Body() request: PaymentFinishReq, @Req() req: any, @Headers('instancekey') instancekey: string) {
        return this.paymentService.paymentFinish({ ...request, _id: id, user: req.user, instancekey });
    }
    
}
