import { MeterRepository } from './repository/MeterRepository'
import { Repository } from 'typeorm'
import { MeterMetadata } from './entity/MeterMetadata'
import { MeterData, NetzOoeApiClient, ProfileValue } from 'netz-ooe-api-client'
import { toContractData, toMeterDatapoint, toMeterMetadata } from './mapper/Mapper'
import { ContractData } from './model/ContractData'


export class NetzOoeSync {
  private readonly meterRepository: MeterRepository
  private readonly meterMetadataRepository: Repository<MeterMetadata>
  private readonly client: NetzOoeApiClient
  private readonly pastDaysToSync: number

  constructor(
    meterRepository: MeterRepository,
    meterMetadataRepository: Repository<MeterMetadata>,
    client: NetzOoeApiClient,
    pastDaysToSync: number
  ) {
    this.meterRepository = meterRepository
    this.meterMetadataRepository = meterMetadataRepository
    this.client = client
    this.pastDaysToSync = pastDaysToSync
  }

  async doSync() {
    await this.client.performAuthFlow()
    const activeContracts = toContractData(await this.client.getDashboardView())
    await this.syncMeterdataPerContract(activeContracts)
  }

  private async syncMeterdataPerContract(activeContracts: ContractData[]) {
    const toDate = new Date()
    const fromDate = new Date()
    fromDate.setDate(toDate.getDate() - this.pastDaysToSync)
    console.log(`Starting sync for date range ${fromDate.toISOString()} to ${toDate.toISOString()}`)
    for (const contract of activeContracts) {
      console.log('Syncing meterdata for smart meter: ' + contract.meterPointAdministrationNumber)

      const datesRange = this.client.generateDateRange(fromDate, toDate)
      const meterValues = await this.processRequestsForContract(datesRange, contract)
      await this.saveMeterdata(contract, meterValues)

      console.log(`Synced ${meterValues?.length} data points for meter number ${contract.meterPointAdministrationNumber}`)
    }
  }

  private async processRequestsForContract(dates: string[], contract: ContractData) {
    const promises: Promise<MeterData>[] = []
    for (const date of dates) {
      const payload = this.client.buildMeterdataRequest(date, contract.contractAccountNumber, contract.meterPointAdministrationNumber)
      promises.push(this.client.getMeterData(payload))
    }
    const resolvedPromises = await Promise.all(promises)
    return resolvedPromises
      .flatMap(i => i.profileValues)
  }

  private async saveMeterdata(contract: ContractData, meterValues: ProfileValue[]) {
    const meterMetadataEntity = toMeterMetadata(contract)
    await this.meterMetadataRepository.save(meterMetadataEntity)
    const mappedDatapoints = meterValues
      .map(profileValue => toMeterDatapoint(profileValue, meterMetadataEntity))
      .filter(val => val != undefined)
    await this.meterRepository.bulkUpsert(mappedDatapoints)
  }
}
