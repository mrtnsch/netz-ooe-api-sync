import { DataSource } from 'typeorm'
import { MeterDataPoint } from '../entity/MeterDataPoint'

export class MeterRepository {
  private readonly appDataSource: DataSource

  constructor(datasource: DataSource) {
    this.appDataSource = datasource
  }

  public bulkUpsert(meterData: MeterDataPoint[]) {
    return this.appDataSource.createQueryBuilder()
      .insert()
      .into(MeterDataPoint)
      .values(meterData)
      .orUpdate(
        ['value'],
        ['meterMetadataMeterPointAdministrationNumber', 'datetime'],
        {
          skipUpdateIfNoValuesChanged: true
        })
      .execute()
  }

}
