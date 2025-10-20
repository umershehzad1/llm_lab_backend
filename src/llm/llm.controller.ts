import { Controller, Post, Body, Get, Param, Res, UseFilters } from '@nestjs/common'
import { LlmService } from './llm.service'
import { GenerateDto } from './dto/generate'
import { GenerateRangeDto } from './dto/generate-range.dto'
import type { Response as ExpressResponse } from 'express'
import { HttpExceptionFilter } from '../../utils/http-exception.filter'

@UseFilters(HttpExceptionFilter)
@Controller('llm')
export class LlmController {
  constructor(private readonly llmService: LlmService) { }

  @Post('generate')
  async generate(@Body() dto: GenerateDto) {
    return await this.llmService.generate(dto)
  }

  @Post('stream')
  async stream(@Body() dto: GenerateDto, @Res() res: ExpressResponse) {
    return await this.llmService.streamResponse(dto, res)
  }

  @Post('generate-range')
  async generateRange(@Body() dto: GenerateRangeDto) {
    return await this.llmService.generateRange(dto)
  }

  @Get()
  async getAll() {
    return await this.llmService.getAll()
  }

  @Get(':id')
  async getOne(@Param('id') id: number) {
    return await this.llmService.getOne(Number(id))
  }
}
