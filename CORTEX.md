# Cortex CLI - Fork of Gemini CLI

This is a community fork of Google's Gemini CLI with enhanced features and additional AI provider support.

## Key Changes from Original Gemini CLI

### 🔄 Rebranding
- Package name: `@markcodering/cortex-cli` (was `@google/gemini-cli`)
- Binary command: `cortex` (was `gemini`)
- Repository: https://github.com/MarkCodering/cortex-cli

### 🆕 New Features
- **Ollama Support**: Local AI inference with privacy-focused approach
- **Extended Provider Support**: Framework ready for additional AI providers
- **Enhanced Authentication**: `CORTEX_AUTH_TYPE` environment variable support

### 🔧 Technical Changes
- Updated all package names and imports
- Added `OllamaContentGenerator` class
- Extended `AuthType` enum with `USE_OLLAMA`
- Updated build system and bundle output

## Installation & Usage

### Install Cortex CLI
```bash
npm install -g @markcodering/cortex-cli
```

### Basic Usage
```bash
# Interactive mode
cortex

# Direct prompt
cortex -p "Explain this code"

# With specific model
cortex -m llama2
```

### Ollama Setup
```bash
# Install Ollama
curl https://ollama.ai/install.sh | sh

# Pull a model
ollama pull llama2

# Start Ollama server
ollama serve

# Use with Cortex CLI
export CORTEX_AUTH_TYPE=ollama
export OLLAMA_BASE_URL=http://localhost:11434  # optional
cortex -m llama2
```

### Environment Variables
- `CORTEX_AUTH_TYPE`: Set to 'ollama' for local AI
- `OLLAMA_BASE_URL`: Ollama server URL (default: http://localhost:11434)
- All original Gemini CLI environment variables are still supported

## Migration from Gemini CLI

If you're migrating from the original Gemini CLI:

1. **Command Change**: Replace `gemini` with `cortex` in your scripts
2. **Environment Variables**: Optionally set `CORTEX_AUTH_TYPE=ollama` for local AI
3. **Configuration**: Existing `.gemini/` settings should work as-is

## Original Features Preserved

All original Gemini CLI features are preserved:
- OAuth authentication with Google
- Gemini API key support
- Vertex AI integration
- MCP server support
- File operations and tools
- IDE integration
- Checkpointing and memory

## Contributing

We welcome contributions! This fork aims to:
- Maintain compatibility with upstream Gemini CLI
- Add support for additional AI providers
- Enhance privacy and local AI capabilities
- Provide community-driven improvements

## Acknowledgments

This project is based on Google's excellent [Gemini CLI](https://github.com/google-gemini/gemini-cli). We're grateful to Google and the open-source community for creating such a powerful tool.

## License

Apache 2.0 (same as original)
