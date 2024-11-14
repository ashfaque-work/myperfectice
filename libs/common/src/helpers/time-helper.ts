import { config } from '../config';
import * as moment from 'moment';

function timezoneOffset(date, offset) {
    let serverOffset = config.debugMode ? (new Date()).getTimezoneOffset() : 0;
    let totalOffset = offset ? 60 * 1000 * (Number(offset) - serverOffset) : 0

    return new Date(date.getTime() + totalOffset)
}

export default {
    timezoneOffset: timezoneOffset,
    getStartOfToday: (offset) => {
        let startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        return timezoneOffset(startOfDay, offset)
    },
    getEndOfToday: (offset) => {
        let endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);
        return timezoneOffset(endOfDay, offset)
    },
    getStartOfDate: (date, offset) => {
        date.setHours(0, 0, 0, 0);
        return timezoneOffset(date, offset)
    },
    getEndOfDate: (date, offset) => {
        date.setHours(23, 59, 59, 999);
        return timezoneOffset(date, offset)
    },
    lastDays: (days, offset?) => {
        return moment().utcOffset(Number(offset || 0)).startOf('day').subtract(days, 'day').toDate()
    },
    lastDaysEnd: (days, offset) => {
        return moment().utcOffset(Number(offset || 0)).endOf('day').subtract(days, 'day').toDate()
    }
}