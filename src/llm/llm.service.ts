import { Injectable, InternalServerErrorException, BadRequestException, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import OpenAI from 'openai'
import { PrismaService } from '../prisma.service'
import { GenerateDto } from './dto/generate'
import { GenerateRangeDto } from './dto/generate-range.dto'
import type { Response as ExpressResponse } from 'express'

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name)
  private openai: OpenAI

  constructor(private prisma: PrismaService, private config: ConfigService) {
    this.openai = new OpenAI({ apiKey: this.config.get('OPENAI_API_KEY') })
  }

  async generate(dto: GenerateDto) {
    try {
      const { prompt, temperature, topP, model } = dto
      if (!prompt) throw new BadRequestException('Prompt cannot be empty')

      const completion = await this.openai.chat.completions.create({
        model: model || 'gpt-4o-mini',
        temperature,
        top_p: topP,
        messages: [{ role: 'user', content: prompt }],
      })

      const response = completion.choices[0].message.content || ''
      const metrics = this.calculateMetrics(response)

      const experiment = await this.prisma.experiment.create({
        data: { prompt, temperature, topP, response, metrics },
      })

      return experiment
    } catch (err: any) {
      this.logger.error(`Error generating completion: ${err.message}`)
      throw new BadRequestException('Failed to generate completion')
    }
  }

  async generateRange(dto: GenerateRangeDto) {
    try {
      const { prompt, combinations } = dto
      if (!prompt || !Array.isArray(combinations))
        throw new BadRequestException('Invalid input for generate-range')

      const results: Array<{ experiment: any; metrics: any }> = []

      for (const combo of combinations) {
        const { temperature, topP } = combo
        const completion = await this.openai.chat.completions.create({
          model: 'gpt-4o-mini',
          temperature,
          top_p: topP,
          messages: [{ role: 'user', content: prompt }],
        })

        const response = completion.choices[0].message.content || ''
        const metrics = this.calculateMetrics(response)

        const experiment = await this.prisma.experiment.create({
          data: { prompt, temperature, topP, response, metrics },
        })

        results.push({ experiment, metrics })
      }

      return results
    } catch (err: any) {
      this.logger.error(`Error generating range: ${err.message}`)
      throw new BadRequestException('Failed to generate range experiments')
    }
  }

  async streamResponse(dto: GenerateDto, res: ExpressResponse) {
    const { prompt, temperature, topP, model } = dto
    if (!prompt) {
      res.status(400).write('data: Invalid prompt\n\n')
      return res.end()
    }

    let fullResponse = ''
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')

    try {
      const stream = await this.openai.chat.completions.create({
        model: model || 'gpt-4o-mini',
        temperature,
        top_p: topP,
        stream: true,
        messages: [{ role: 'user', content: prompt }],
      })

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || ''
        if (content) {
          fullResponse += content
          res.write(`data: ${content}\n\n`)
        }
      }

      res.write(`event: end\ndata: [DONE]\n\n`)
      res.end()

      const metrics = this.calculateMetrics(fullResponse)
      await this.prisma.experiment.create({
        data: { prompt, temperature, topP, response: fullResponse, metrics },
      })
    } catch (err: any) {
      this.logger.error(`Streaming error: ${err.message}`)
      res.write(`event: error\ndata: ${JSON.stringify({ error: 'Streaming failed' })}\n\n`)
      res.end()
    }
  }

  calculateMetrics(text: string) {
    try {
      const words = text.split(/\s+/).filter(Boolean).length
      const sentences = text.split(/[.!?]/).filter(Boolean).length
      const coherenceRaw = Math.min((sentences / words) * 10, 1)
      const punctuationRaw = (text.match(/[,.!?]/g) || []).length / Math.max(words, 1)

      const coherence = Number(coherenceRaw.toFixed(2))
      const punctuation = Number(punctuationRaw.toFixed(2))

      return { words, sentences, coherence, punctuation }
    } catch (err) {
      this.logger.warn(`Metric calculation failed: ${err.message}`)
      return { words: 0, sentences: 0, coherence: 0, punctuation: 0 }
    }
  }

  async getAll() {
    try {
      return await this.prisma.experiment.findMany({ orderBy: { createdAt: 'desc' } })
    } catch (err: any) {
      this.logger.error(`Error fetching experiments: ${err.message}`)
      throw new BadRequestException('Failed to fetch experiments')
    }
  }

  async getOne(id: number) {
    try {
      const experiment = await this.prisma.experiment.findUnique({ where: { id } })
      if (!experiment) throw new BadRequestException('Experiment not found')
      return experiment
    } catch (err: any) {
      this.logger.error(`Error fetching experiment ${id}: ${err.message}`)
      throw new BadRequestException('Failed to fetch experiment details')
    }
  }
}
