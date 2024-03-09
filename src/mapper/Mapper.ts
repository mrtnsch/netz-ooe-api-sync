import { MeterMetadata } from '../entity/MeterMetadata'
import { BusinessPartnerOverview, ProfileValue } from 'netz-ooe-api-client'
import { MeterDataPoint } from '../entity/MeterDataPoint'
import { ContractData } from '../model/ContractData'

export function toMeterMetadata(contract: ContractData): MeterMetadata {
  const meterMetadataEntity = new MeterMetadata()
  meterMetadataEntity.branch = contract.branch
  meterMetadataEntity.moveInDate = new Date(contract.moveInDate)
  meterMetadataEntity.meterPointAdministrationNumber = contract.meterPointAdministrationNumber
  meterMetadataEntity.contractAccountNumber = contract.contractAccountNumber
  return meterMetadataEntity
}

export function toMeterDatapoint(profileValue: ProfileValue, meterMetadataEntity: MeterMetadata): MeterDataPoint | undefined {
  if (profileValue == undefined) return
  const datapoint = new MeterDataPoint()
  datapoint.datetime = new Date(profileValue.datetime)
  datapoint.value = profileValue.value
  datapoint.meterMetadata = meterMetadataEntity
  return datapoint
}

export function toContractData(data: BusinessPartnerOverview): ContractData[] {
  return data.contractAccounts
    .filter(c => c.active === true)
    .map(c => {
      const nestedContract = c.contracts.slice().shift()
      return {
        contractAccountNumber: c.contractAccountNumber,
        meterPointAdministrationNumber: nestedContract.meterPointAdministrationNumber,
        branch: nestedContract.branch,
        moveInDate: nestedContract.moveInDate
      }
    })
}
