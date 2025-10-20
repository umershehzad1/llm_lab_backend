import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common'

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp()
        const response = ctx.getResponse()
        const request = ctx.getRequest()

        const status =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.BAD_REQUEST

        const message =
            exception instanceof HttpException
                ? exception.getResponse()
                : 'Bad Request'

        response.status(status).json({
            success: false,
            statusCode: status,
            path: request.url,
            message,
            timestamp: new Date().toISOString(),
        })
    }
}
