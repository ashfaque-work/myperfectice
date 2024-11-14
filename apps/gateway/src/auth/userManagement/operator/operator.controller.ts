import { Controller, Get, Headers, Param, Query, Req, UseGuards } from "@nestjs/common";
import { ApiHeader, ApiTags } from "@nestjs/swagger";
import { OperatorService } from "./operator.service";
import { AuthenticationGuard } from "@app/common/auth";

@ApiTags('Operator')
@Controller('institute')
export class OperatorController {
    constructor(private operatorService: OperatorService) {}

    @Get('/dashboard/questionaddedtrend/:id')
    @ApiHeader({name: 'authtoken'})
    @UseGuards(AuthenticationGuard)
    async operatorQuestionAddedTrend(@Headers('instancekey') instancekey: string ,@Param('id') id: string, @Req() req: any) {
        const combinedData = {
            id,
            user: req.user
        }
        console.log("operator controller")
        return this.operatorService.operatorQuestionAddedTrend(combinedData);
    }

    @Get('/dashboard/questiondistributionbysubject/:id')
    @ApiHeader({name: 'authtoken'})
    @UseGuards(AuthenticationGuard)
    async getQuestionDistributionBySubject(@Param('id') id: string, @Req() req: any, @Query('subject') subject: string) {
        const combinedData = {
            id,
            subject,
            user: req.user
        }
        return this.operatorService.getQuestionDistributionBySubject(combinedData);
    }
}