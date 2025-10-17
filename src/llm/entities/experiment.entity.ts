import { ApiProperty } from '@nestjs/swagger'

export class ExperimentEntity {
  @ApiProperty()
  id: number

  @ApiProperty()
  prompt: string

  @ApiProperty()
  temperature: number

  @ApiProperty()
  topP: number

  @ApiProperty()
  response: string

  @ApiProperty({
    example: {
      words: 120,
      sentences: 8,
      coherence: 0.85,
      punctuation: 0.12,
    },
  })
  metrics: Record<string, any>

  @ApiProperty()
  createdAt: Date
}
