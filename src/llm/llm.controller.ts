import { Controller, Post, Body, Get, Param, Res } from '@nestjs/common'
import { LlmService } from './llm.service'
import { GenerateDto } from './dto/generate'
import { GenerateRangeDto } from './dto/generate-range.dto'
import type { Response as ExpressResponse } from 'express'

@Controller('llm')
export class LlmController {
  constructor(private readonly llmService: LlmService) { }

  @Post('generate')
  async generate(@Body() dto: GenerateDto) {
    return this.llmService.generate(dto)
  }

  @Post('stream')
  async stream(@Body() dto: GenerateDto, @Res() res: ExpressResponse) {
    return this.llmService.streamResponse(dto, res)
  }

  @Post('generate-range')
  async generateRange(@Body() dto: GenerateRangeDto) {
    return this.llmService.generateRange(dto)
  }

  @Get()
  async getAll() {
    return this.llmService.getAll()
  }

  @Get(':id')
  async getOne(@Param('id') id: number) {
    return this.llmService.getOne(Number(id))
  }
}
