import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import OpenAI from 'openai'
import { PrismaService } from '../prisma.service'
import { GenerateDto } from './dto/generate'
import { GenerateRangeDto } from './dto/generate-range.dto'
import type { Response as ExpressResponse } from 'express'

@Injectable()
export class LlmService {
  private openai: OpenAI

  constructor(private prisma: PrismaService, private config: ConfigService) {
    this.openai = new OpenAI({ apiKey: this.config.get('OPENAI_API_KEY') })
  }

  async generate(dto: GenerateDto) {
    const { prompt, temperature, topP } = dto

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

    return experiment
  }

  async generateRange(dto: GenerateRangeDto) {
    const { prompt, combinations } = dto
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
  }


  async streamResponse(dto: GenerateDto, res: ExpressResponse) {
    const { prompt, temperature, topP } = dto

    // Start streaming request
    const stream = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature,
      top_p: topP,
      stream: true,
      messages: [{ role: 'user', content: prompt }],
    })

    let fullResponse = ''

    // Set headers for Server-Sent Events
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')

    // Send chunks as they arrive
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || ''
      if (content) {
        fullResponse += content
        res.write(`data: ${content}\n\n`)
      }
    }

    // Send final signal
    res.write(`event: end\ndata: [DONE]\n\n`)
    res.end()

    // Save full response in DB
    const metrics = this.calculateMetrics(fullResponse)
    await this.prisma.experiment.create({
      data: { prompt, temperature, topP, response: fullResponse, metrics },
    })
  }

  // Simple example metrics: length, coherence, punctuation balance
  calculateMetrics(text: string) {
    const words = text.split(/\s+/).length
    const sentences = text.split(/[.!?]/).length
    const coherence = Math.min((sentences / words) * 10, 1)
    const punctuation = (text.match(/[,.!?]/g) || []).length / words
    return { words, sentences, coherence, punctuation }
  }

  async getAll() {
    return this.prisma.experiment.findMany({ orderBy: { createdAt: 'desc' } })
  }

  async getOne(id: number) {
    return this.prisma.experiment.findUnique({ where: { id } })
  }
}
