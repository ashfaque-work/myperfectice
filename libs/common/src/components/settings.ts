import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { RedisCaching } from "../services";
import axios from "axios";
import * as geoip from 'geoip-lite';
import { SettingRepository } from "../database";

@Injectable()
export class Settings {

    constructor(
        private readonly redisCache: RedisCaching,
        private readonly settingRepository: SettingRepository,
    ) { }

    async internalConvertCurrency(request: any, fromCurrency: string, toCurrency: string) {
        let from = encodeURIComponent(fromCurrency)
        let to = encodeURIComponent(toCurrency)
        let query = `${from}_${to}`

        let cacheRate = await this.redisCache.getAsync(request.instancekey, 'currency_' + query)
        if (cacheRate) {
            return cacheRate
        }

        let url = `https://api.freecurrencyapi.com/v1/latest?apikey=fca_live_NTF9rpfcQytUSkO8f1uU3TvYNbtQPSVYMXhHGu3N&currencies=${to}&base_currency=${from}`
        
        const response = await axios.get(url);
        
        const body = response.data.data;
        
        if (body && body[to]) {
            // Cache currency rate for 1 hour
            await this.redisCache.set({ instancekey: request.instancekey }, 'currency_' + query, { code: query, rate: body[to] }, 60 * 60);
            return { code: query, rate: body[to] };
        } else {
            // Get data from db
            const exchange = await this.settingRepository.findOne({ slug: 'currencyExchange' });
            if (exchange && exchange.pairs[query]) {
                await this.redisCache.set({ instancekey: request.instancekey }, 'currency_' + query, { code: query, rate: exchange.pairs[query] }, 60 * 60);
                return { code: query, rate: exchange.pairs[query] };
            } else {
                throw new InternalServerErrorException();
            }
        }
    }

    /* 
    * @request: instancekey, ip, user.country, user.country.code
    */
    async setPriceByUserCountry(request: any, item) {
        try {
            let settings: any = await this.redisCache.getSettingAsync(request.instancekey)

            // get default country first
            let defaultC = settings.countries.find(c => c.default)
            if (!defaultC) {
                defaultC = settings.countries[0]
            }

            // lookup user country
            let userCountryCode = defaultC.code;
            if (!request.user || !request.user.country) {
                let geo = geoip.lookup(request.ip)
                
                if (geo && geo.country) {
                    userCountryCode = geo.country
                }
            } else {
                userCountryCode = request.user.country.code
            }

            let userCountry = settings.countries.find(c => c.code == userCountryCode)
            if (!userCountry) {
                userCountry = defaultC;
            }
            
            // get price
            if (item.countries && item.countries[0]) {
                let itemCountry = item.countries.find(c => c.code == userCountry.code);

                // if country data is set in item
                if (itemCountry) {
                    item.price = itemCountry.price
                    item.marketPlacePrice = itemCountry.marketPlacePrice
                    item.discountValue = itemCountry.discountValue
                    item.currency = itemCountry.currency
                    return;
                }

                // else we need to convert the currency
                itemCountry = item.countries[0]
                let result: any = await this.internalConvertCurrency(request, itemCountry.currency, userCountry.currency)
                item.price = itemCountry.price * result.rate
                item.marketPlacePrice = itemCountry.marketPlacePrice * result.rate
                item.discountValue = itemCountry.discountValue
                item.currency = userCountry.currency

                // round it up for INR
                if (userCountry.currency == 'INR') {
                    item.price = Math.round(item.price)
                    item.marketPlacePrice = Math.round(item.marketPlacePrice)
                }
            } else {
                item.price = 0
                item.marketPlacePrice = 0
                item.discountValue = 0
                item.currency = userCountry.currency

                Logger.debug(request.instancekey + ': Item missing countries data ' + (item._id ? item._id.toString() : ''))
            }
        } catch (ex) {
            Logger.error(ex)
            item.price = 0
            item.marketPlacePrice = 0
            item.discountValue = 0
            item.currency = 'USD'
        }
    }

    /* 
    * @request: instancekey, body.to, body.from, user.country, user.country.code
    */
    async convertCurrency(request, res) {
        try {
            if (!request.body.to) {
                return res.sendStatus(400)
            }

            let from;
            if (!request.body.from) {
                let settings: any = await this.redisCache.getSettingAsync(request.instancekey)
                let country = settings.countries.find(c => c.default);
                if (request.user.country && request.user.country.code) {
                    country = settings.countries.find(c => c.code == request.user.country.code)
                }
                if (!country) {
                    return res.sendStatus(400)
                }

                from = country.currency
            } else {
                from = request.body.from
            }

            let result = await this.internalConvertCurrency(request, from, request.body.to)

            res.json(result)
        } catch (ex) {
            Logger.error(ex)
            return res.sendStatus(500)
        }
    }
}