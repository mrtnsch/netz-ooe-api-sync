import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm'
import { MeterDataPoint } from './MeterDataPoint'

@Entity()
export class MeterMetadata {
  @PrimaryColumn('text')
  meterPointAdministrationNumber: string
  @Column('text')
  contractAccountNumber: string
  @Column('text')
  branch: string
  @Column('date')
  moveInDate: Date
  @OneToMany(() => MeterDataPoint, (meterDataPoint) => meterDataPoint.meterMetadata, { cascade: true })
  meterDataPoint: MeterDataPoint[]
}
