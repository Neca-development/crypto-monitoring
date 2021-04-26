import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import Config from 'config'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  let server: any = Config.get('server')

  await app.listen(server.port)
}
bootstrap()
