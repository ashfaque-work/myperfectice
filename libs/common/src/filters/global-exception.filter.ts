import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpStatus,
    HttpException,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

function isValidJson(str) {
    try {
        JSON.parse(str);
        return true;
    } catch (e) {
        return false;
    }
}

interface CustomException {
    code?: number;
    details?: string;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    constructor(private readonly httpAdapterHost: HttpAdapterHost) { }

    catch(exception: unknown, host: ArgumentsHost): void {
        console.log('exception>>>>>', exception);
        // if (exception instanceof RpcException) console.log('RPC Exception::::::::::::::');
        // if (exception instanceof HttpException) console.log('HTTP Exception::::::::::::::');
        const customException = exception as CustomException;

        let message = undefined;
        const { httpAdapter } = this.httpAdapterHost;
        let httpStatus: HttpStatus;
        const ctx = host.switchToHttp();

        if (exception instanceof HttpException) {
            httpStatus = exception.getStatus();
            message = exception["response"]["message"];
        } else {
            const errorCode = customException.code;
            let errorDetails: any;
            if (isValidJson(customException?.details)) {
                errorDetails = JSON.parse(customException.details);
            } else {
                if (errorCode == 14) {
                    httpStatus = HttpStatus.SERVICE_UNAVAILABLE;
                    const responseBody = {
                        status: HttpStatus.SERVICE_UNAVAILABLE,
                        message: "Service unavailable! Possible solution: Check if all Microservices are running."
                    };
                    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
                    return;
                }
                httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
                const responseBody = {
                    status: HttpStatus.INTERNAL_SERVER_ERROR,
                    message: "Internal Server Error"
                };
                httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
                return;
            }
            message = Array.isArray(errorDetails.error) ? errorDetails.error : [errorDetails.error];

            //https://grpc.github.io/grpc/core/md_doc_statuscodes.html
            switch (errorCode) {
                case 0:
                    httpStatus = HttpStatus.OK;
                    break;
                case 1:
                    httpStatus = HttpStatus.REQUEST_TIMEOUT;
                    break;
                case 2:
                    httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
                    break;
                case 3:
                case 9:
                case 11:
                    httpStatus = HttpStatus.BAD_REQUEST;
                    break;
                case 4:
                    httpStatus = HttpStatus.GATEWAY_TIMEOUT;
                    break;
                case 5:
                    httpStatus = HttpStatus.NOT_FOUND;
                    break;
                case 6:
                    httpStatus = HttpStatus.CONFLICT;
                    break;
                case 7:
                    httpStatus = HttpStatus.FORBIDDEN;
                    break;
                case 8:
                    httpStatus = HttpStatus.TOO_MANY_REQUESTS;
                    break;
                case 10:
                    httpStatus = HttpStatus.CONFLICT;
                    break;
                case 12:
                    httpStatus = HttpStatus.NOT_IMPLEMENTED;
                    break;
                case 13:
                case 15:
                    httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
                    break;
                case 14:
                    httpStatus = HttpStatus.SERVICE_UNAVAILABLE;
                    break;
                case 16:
                    httpStatus = HttpStatus.UNAUTHORIZED;
                    break;

                default:
                    httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
                    break;
            }
        }

        const responseBody = {
            status: httpStatus,
            message: message,
            path: httpAdapter.getRequestUrl(ctx.getRequest()),
        };

        httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
    }
}
