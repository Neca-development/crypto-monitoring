import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common'
import { dbErrorCodes } from 'src/config/db-error-codes'
import { QueryFailedError } from 'typeorm'

@Catch(QueryFailedError)
export class QueryFailedErrorFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    console.log(`Exception is`, exception)

    const ctx = host.switchToHttp()
    const response = ctx.getResponse()

    let message
    let statusCode

    if (exception.code == dbErrorCodes.duplicate) {
      message = 'Entity already exists'
      statusCode = 409
    }

    return response.status(statusCode).json({
      status: statusCode,
      message: message
    })
  }
}

/*
Сам объект отлавливаемой ошибки
QueryFailedError 
{
  length: 427,
  severity: 'ОШИБКА',
  code: '23505',
  detail: 'Ключ "("fullName")=(Александр Шейков)" уже существует.',
  hint: undefined,
  position: undefined,
  internalPosition: undefined,
  internalQuery: undefined,
  where: undefined,
  schema: 'public',
  table: 'user',
  column: undefined,
  dataType: undefined,
  constraint: 'UQ_035190f70c9aff0ef331258d28b',
  file: 'd:\\pginstaller_13.auto\\postgres.windows-x64\\src\\backend\\access\\nbtree\\nbtinsert.c',
  line: '656',
  routine: '_bt_check_unique',
  query: 'INSERT INTO "user"("email", "fullName", "role", "password", "salt") VALUES (DEFAULT, $1, $2, DEFAULT, DEFAULT) RETURNING "id"',   
  parameters: [ 'Александр Шейков', 'CLIENT' ]
}

*/
