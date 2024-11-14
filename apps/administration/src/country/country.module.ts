import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CountryService } from './country.service';
import { CountryController } from './country.controller';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
		}),
	],
	controllers: [CountryController],
	providers: [CountryService],
})
export class CountryModule { }