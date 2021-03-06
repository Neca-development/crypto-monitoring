// export const typeormConfig: TypeOrmModuleOptions = {
//   type: 'postgres',
//   username: 'postgres',
//   password: 'admin',
//   host: 'localhost',
//   synchronize: true,
//   port: 5432,
//   database: 'nest-jwt',
//   autoLoadEntities: true,
//   entities: [__dirname + '/../**/*.entity.js']
// };asd

import { TypeOrmModuleOptions } from '@nestjs/typeorm'
import Config from 'config'
import { EthWalletsPool } from 'src/tokens/classes/ETHWalletsPool'

const dbConfig: any = Config.get('db')

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: dbConfig.type,
  host: process.env.RDS_HOSTNAME || dbConfig.host,
  port: process.env.RDS_PORT || dbConfig.port,
  username: process.env.RDS_USERNAME || dbConfig.username,
  password: process.env.RDS_PASSWORD || dbConfig.password,
  database: process.env.RDS_DB_NAME || dbConfig.database,
  entities: [__dirname + '/../**/*.entity.{js,ts}'],
  synchronize: process.env.TYPEORM_SYNC || dbConfig.synchronize,
  subscribers: [EthWalletsPool]
}
