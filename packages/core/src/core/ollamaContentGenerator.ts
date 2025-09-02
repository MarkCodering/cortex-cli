/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type {
  GenerateContentResponse,
  GenerateContentParameters,
  CountTokensResponse,
  CountTokensParameters,
  EmbedContentResponse,
  EmbedContentParameters,
  Content,
  Part,
} from '@google/genai';
import { FinishReason } from '@google/genai';
import type { ContentGenerator } from './contentGenerator.js';

/**
 * Content generator that interfaces with Ollama for local AI model inference.
 */
export class OllamaContentGenerator implements ContentGenerator {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:11434') {
    this.baseUrl = baseUrl;
  }

  async generateContent(
    request: GenerateContentParameters,
    userPromptId: string,
  ): Promise<GenerateContentResponse> {
    const contents = Array.isArray(request.contents) ? request.contents : [request.contents];
    const prompt = this.convertContentsToPrompt(contents.filter((c): c is Content => typeof c === 'object'));
    
    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: request.model,
          prompt,
          stream: false,
          options: {
            temperature: request.config?.temperature || 0,
            top_p: request.config?.topP || 1,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return this.convertOllamaResponseToGemini(result);
    } catch (error) {
      throw new Error(`Ollama generation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async generateContentStream(
    request: GenerateContentParameters,
    userPromptId: string,
  ): Promise<AsyncGenerator<GenerateContentResponse>> {
    const contents = Array.isArray(request.contents) ? request.contents : [request.contents];
    const prompt = this.convertContentsToPrompt(contents.filter((c): c is Content => typeof c === 'object'));
    
    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: request.model,
        prompt,
        stream: true,
        options: {
          temperature: request.config?.temperature || 0,
          top_p: request.config?.topP || 1,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
    }

    return this.convertOllamaStreamToGemini(response);
  }

  async countTokens(request: CountTokensParameters): Promise<CountTokensResponse> {
    const contents = Array.isArray(request.contents) ? request.contents : [request.contents];
    const prompt = this.convertContentsToPrompt(contents.filter((c): c is Content => typeof c === 'object'));
    // Rough estimation: ~4 characters per token for English text
    const estimatedTokens = Math.ceil(prompt.length / 4);
    
    return {
      totalTokens: estimatedTokens,
    };
  }

  async embedContent(request: EmbedContentParameters): Promise<EmbedContentResponse> {
    try {
      const contents = Array.isArray(request.contents) ? request.contents : [request.contents];
      const prompt = this.convertContentsToPrompt(contents.filter((c): c is Content => typeof c === 'object'));
      
      const response = await fetch(`${this.baseUrl}/api/embeddings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: request.model || 'nomic-embed-text',
          prompt,
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return {
        embeddings: [{ values: result.embedding }],
      };
    } catch (error) {
      throw new Error(`Ollama embedding failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Add generateJson method for compatibility with GeminiClient interface
  async generateJson(
    contents: Content[],
    schema: Record<string, unknown>,
    abortSignal: AbortSignal,
    model?: string,
  ): Promise<Record<string, unknown>> {
    const prompt = this.convertContentsToPrompt(contents);
    const jsonPrompt = `${prompt}\n\nPlease respond with valid JSON that matches this schema: ${JSON.stringify(schema)}`;
    
    const targetModel = model || 'gpt-oss:20b';
    
    try {
      // First try with JSON format
      let response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: targetModel,
          prompt: jsonPrompt,
          stream: false,
          format: 'json',
        }),
        signal: abortSignal,
      });

      // If JSON format fails, try without format constraint
      if (!response.ok && response.status === 400) {
        response = await fetch(`${this.baseUrl}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: targetModel,
            prompt: jsonPrompt,
            stream: false,
          }),
          signal: abortSignal,
        });
      }

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      const responseText = result.response || '';
      
      try {
        return JSON.parse(responseText);
      } catch (parseError) {
        // If the response isn't valid JSON, try to extract JSON from it
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
        throw new Error(`Failed to parse JSON from Ollama response: ${responseText}`);
      }
    } catch (error) {
      throw new Error(`Ollama JSON generation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private convertContentsToPrompt(contents: Content[]): string {
    return contents.map(content => {
      const parts = content.parts || [];
      if (content.role === 'system') {
        return `System: ${this.convertPartsToText(parts)}`;
      } else if (content.role === 'user') {
        return `User: ${this.convertPartsToText(parts)}`;
      } else if (content.role === 'model') {
        return `Assistant: ${this.convertPartsToText(parts)}`;
      }
      return this.convertPartsToText(parts);
    }).join('\n\n');
  }

  private convertPartsToText(parts: Part[] | undefined): string {
    if (!parts) return '';
    return parts.map(part => {
      if ('text' in part && part.text) {
        return part.text;
      }
      if ('functionCall' in part && part.functionCall) {
        return `[Function Call: ${part.functionCall.name}]`;
      }
      if ('functionResponse' in part && part.functionResponse) {
        return `[Function Response: ${JSON.stringify(part.functionResponse.response)}]`;
      }
      return '[Unsupported content type]';
    }).join(' ');
  }

  private convertOllamaResponseToGemini(response: any): GenerateContentResponse {
    const candidates = [
      {
        content: {
          role: 'model',
          parts: [{ text: response.response || '' }],
        },
        finishReason: response.done ? FinishReason.STOP : undefined,
      },
    ];
    
    const usageMetadata = {
      promptTokenCount: response.prompt_eval_count || 0,
      candidatesTokenCount: response.eval_count || 0,
      totalTokenCount: (response.prompt_eval_count || 0) + (response.eval_count || 0),
    };

    // Create a compatible response object
    return {
      candidates,
      usageMetadata,
      get text() {
        return response.response || '';
      },
      get data() {
        return response.response || '';
      },
      functionCalls: [],
      executableCode: null,
      codeExecutionResult: null,
    } as any;
  }

  private async *convertOllamaStreamToGemini(
    response: Response,
  ): AsyncGenerator<GenerateContentResponse> {
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body available');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim()) {
            try {
              const chunk = JSON.parse(line);
              
              // Only yield chunks that have actual response content or are done
              // Skip chunks with only thinking content
              if (chunk.response || chunk.done) {
                const streamResponse = {
                  candidates: [
                    {
                      content: {
                        role: 'model',
                        parts: [{ text: chunk.response || '' }],
                      },
                      finishReason: chunk.done ? FinishReason.STOP : undefined,
                    },
                  ],
                  usageMetadata: chunk.done ? {
                    promptTokenCount: chunk.prompt_eval_count || 0,
                    candidatesTokenCount: chunk.eval_count || 0,
                    totalTokenCount: (chunk.prompt_eval_count || 0) + (chunk.eval_count || 0),
                  } : undefined,
                  get text() {
                    return chunk.response || '';
                  },
                  get data() {
                    return chunk.response || '';
                  },
                  functionCalls: [],
                  executableCode: null,
                  codeExecutionResult: null,
                } as any;
                
                yield streamResponse;
              }
            } catch (e) {
              // Skip malformed JSON lines
              continue;
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}
