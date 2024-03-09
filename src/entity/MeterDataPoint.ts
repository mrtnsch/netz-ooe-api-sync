import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { MeterMetadata } from './MeterMetadata'

@Entity()
@Index(['meterMetadata', 'datetime'], { unique: true })
export class MeterDataPoint {
  @PrimaryGeneratedColumn()
  id: number
  @Column('timestamp with time zone')
  datetime: Date
  @Column('decimal')
  value: number
  @ManyToOne(() => MeterMetadata, (meterMetadata) => meterMetadata.meterDataPoint)
  meterMetadata: MeterMetadata
}
