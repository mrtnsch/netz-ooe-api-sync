import { DataSource } from 'typeorm'
import { MeterDataPoint } from './entity/MeterDataPoint'
import { MeterMetadata } from './entity/MeterMetadata'
import 'dotenv/config'


export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.POSTGRES_CONNECTION_STRING,
  ssl: {
    rejectUnauthorized: true,
    ca: process.env.AIVEN_CERTIFICATE
  },
  synchronize: true,
  logging: ['warn', 'error', 'migration'],
  entities: [MeterDataPoint, MeterMetadata],
  subscribers: [],
  migrations: []
})
