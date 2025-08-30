/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type { SlashCommand } from './types.js';
import { CommandKind } from './types.js';
import type { HistoryItemInfo, HistoryItemError } from '../types.js';
import { AuthType } from '@markcodering/cortex-cli-core';

export const modelsCommand: SlashCommand = {
  name: 'models',
  kind: CommandKind.BUILT_IN,
  description: 'List and select available Ollama models',
  action: async (context) => {
    const { services, ui } = context;
    const { config, settings } = services;

    // Check if we're using Ollama
    const authType = settings?.merged?.security?.auth?.selectedType;
    if (authType !== AuthType.USE_OLLAMA) {
      const errorItem: Omit<HistoryItemError, 'id'> = {
        type: 'error',
        text: 'The /models command is only available when using Ollama authentication. Set CORTEX_AUTH_TYPE=ollama or configure Ollama in settings.',
      };
      ui.addItem(errorItem, Date.now());
      return;
    }

    try {
      // Get Ollama base URL
      const ollamaBaseUrl = process.env['OLLAMA_BASE_URL'] || 'http://localhost:11434';
      
      // Fetch available models from Ollama
      const response = await fetch(`${ollamaBaseUrl}/api/tags`);
      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const models = data.models || [];

      if (models.length === 0) {
        const noModelsItem: Omit<HistoryItemInfo, 'id'> = {
          type: 'info',
          text: 'No Ollama models found. Install models using: ollama pull <model-name>',
        };
        ui.addItem(noModelsItem, Date.now());
        return;
      }

      // Get current model
      const currentModel = config?.getModel() || 'Not set';

      // Format models list
      let modelsText = `📋 **Available Ollama Models** (${models.length})\n\n`;
      modelsText += `🔹 **Current model:** ${currentModel}\n\n`;
      
      models.forEach((model: any, index: number) => {
        const isActive = model.name === currentModel ? '✅ ' : '   ';
        const size = model.size ? `(${(model.size / 1024 / 1024 / 1024).toFixed(1)}GB)` : '';
        const modified = model.modified_at ? new Date(model.modified_at).toLocaleDateString() : '';
        
        modelsText += `${isActive}${index + 1}. **${model.name}** ${size}\n`;
        if (modified) {
          modelsText += `     Last modified: ${modified}\n`;
        }
        modelsText += '\n';
      });

      modelsText += '\n💡 **To switch models:**\n';
      modelsText += '   • Use `--model=<model-name>` flag\n';
      modelsText += '   • Or set in settings: `/settings model <model-name>`\n';
      modelsText += '\n🔍 **Examples:**\n';
      modelsText += '   • `What is AI? --model=llama3.1:latest`\n';
      modelsText += '   • `/settings model phi4-mini:latest`\n';

      const resultItem: Omit<HistoryItemInfo, 'id'> = {
        type: 'info',
        text: modelsText,
      };

      ui.addItem(resultItem, Date.now());

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorItem: Omit<HistoryItemError, 'id'> = {
        type: 'error',
        text: `❌ **Error fetching Ollama models:**\n\n${errorMessage}\n\nMake sure Ollama is running and accessible at: ${process.env['OLLAMA_BASE_URL'] || 'http://localhost:11434'}`,
      };
      ui.addItem(errorItem, Date.now());
    }
  },
};
