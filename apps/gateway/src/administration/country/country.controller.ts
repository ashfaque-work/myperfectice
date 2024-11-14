import { Controller, Param, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiHeader, ApiQuery } from '@nestjs/swagger';
import { CountryService } from './country.service';
import { AuthenticationGuard } from '@app/common/auth';

@ApiTags('Country')
@Controller('country')
export class CountryController {
	constructor(private countryService: CountryService) { }

	@Get('/')
	findSupport() {
		return this.countryService.findSupport({});
	}

	@Get('/findAllStates/:countryCode')
	findAllStates(@Param('countryCode') countryCode: string) {
		return this.countryService.findAllStates({ countryCode });
	}

	@Get('/info/:code')
	@ApiHeader({ name: 'authtoken', required: true })
	@UseGuards(AuthenticationGuard)
	@ApiQuery({ name: 'iso', required: false })
	getInfo(@Param('code') code: string, @Query('iso') iso?: string) {
		return this.countryService.getInfo({ code, iso });
	}

	@Get('/state/:code')
	@ApiHeader({ name: 'authtoken', required: true })
	@UseGuards(AuthenticationGuard)
	getState(@Param('code') code: string) {
		return this.countryService.getState({ code });
	}

}
