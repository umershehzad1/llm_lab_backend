import { IsString, IsArray, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { IsNumber, Min, Max } from 'class-validator'

class ParameterCombo {
  @IsNumber()
  @Min(0)
  @Max(1)
  temperature: number

  @IsNumber()
  @Min(0)
  @Max(1)
  topP: number
}

export class GenerateRangeDto {
  @IsString()
  prompt: string

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ParameterCombo)
  combinations: ParameterCombo[]
}
