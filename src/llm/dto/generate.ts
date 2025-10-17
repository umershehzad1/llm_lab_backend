import { IsNumber, IsString, Min, Max } from 'class-validator'

export class GenerateDto {
  @IsString()
  prompt: string

  @IsNumber()
  @Min(0)
  @Max(1)
  temperature: number

  @IsNumber()
  @Min(0)
  @Max(1)
  topP: number
}
