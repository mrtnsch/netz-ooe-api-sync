import 'reflect-metadata'
import 'dotenv/config'

import { Credentials, NetzOoeApiClient } from 'netz-ooe-api-client'
import { AppDataSource } from './data-source'
import { MeterMetadata } from './entity/MeterMetadata'
import { MeterRepository } from './repository/MeterRepository'
import { NetzOoeSync } from './NetzOoeSync'

const credentials: Credentials = {
  'j_username': process.env.NETZ_OOE_USERNAME,
  'j_password': process.env.NETZ_OOE_PASSWORD
}

async function main() {
  console.log(`Initiating sync at ${new Date().toISOString()}.`)
  const pastDaysToSync: number = process.env.PAST_DAYS_TO_SYNC ? parseInt(process.env.PAST_DAYS_TO_SYNC) : 7
  const datasource = AppDataSource
  try {
    await datasource.initialize()
    const syncHandler = new NetzOoeSync(
      new MeterRepository(datasource),
      datasource.getRepository(MeterMetadata),
      new NetzOoeApiClient(credentials),
      pastDaysToSync)
    await syncHandler.doSync()
  } finally {
    //close connection
    await datasource?.destroy()

  }

}

main().then(() => console.log(`Finished sync at ${new Date().toISOString()}.`))

