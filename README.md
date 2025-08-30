# Cortex CLI

[![Cortex CLI CI](https://github.com/MarkCodering/cortex-cli/actions/workflows/ci.yml/badge.svg)](https://github.com/MarkCodering/cortex-cli/actions/workflows/ci.yml)
[![Version](https://img.shields.io/npm/v/@markcodering/cortex-cli)](https://www.npmjs.com/package/@markcodering/cortex-cli)
[![License](https://img.shields.io/github/license/MarkCodering/cortex-cli)](https://github.com/MarkCodering/cortex-cli/blob/main/LICENSE)

![Cortex CLI Screenshot](./docs/assets/gemini-screenshot.png)

> **Note:** Cortex CLI is a fork of Google's [Gemini CLI](https://github.com/google-gemini/gemini-cli) with additional Ollama support and enhanced features.

Cortex CLI is an open-source AI agent that brings the power of multiple AI providers directly into your terminal. It provides lightweight access to Gemini, Ollama, and other AI providers, giving you the most direct path from your prompt to various AI models.

## 🚀 Why Cortex CLI?

- **🎯 Multiple AI Providers**: Support for Gemini, Ollama, and more
- **🧠 Powerful Models**: Access to Gemini 2.5 Pro, Llama, CodeLlama, and local models via Ollama
- **🔧 Built-in tools**: Google Search grounding, file operations, shell commands, web fetching
- **🔌 Extensible**: MCP (Model Context Protocol) support for custom integrations
- **💻 Terminal-first**: Designed for developers who live in the command line
- **🛡️ Open source**: Apache 2.0 licensed (forked from Google's Gemini CLI)

## 📦 Installation

### Quick Install

#### Run instantly with npx

```bash
# Using npx (no installation required)
npx https://github.com/MarkCodering/cortex-cli
```

#### Install globally with npm

```bash
npm install -g @markcodering/cortex-cli
```

#### Install globally with Homebrew (macOS/Linux)

```bash
# Note: Homebrew formula coming soon
# brew install cortex-cli
```

#### System Requirements

- Node.js version 20 or higher
- macOS, Linux, or Windows

## Release Cadence and Tags

See [Releases](./docs/releases.md) for more details.

### Preview

New preview releases will be published each week at UTC 2359 on Tuesdays. These releases will not have been fully vetted and may contain regressions or other outstanding issues. Please help us test and install with `preview` tag.

```bash
npm install -g @google/gemini-cli@preview
```

### Stable

- New stable releases will be published each week at UTC 2000 on Tuesdays, this will be the full promotion of last week's `preview` release + any bug fixes and validations. Use `latest` tag.

```bash
npm install -g @google/gemini-cli@latest
```

### Nightly

- New releases will be published each week at UTC 0000 each day, This will be all changes from the main branch as represented at time of release. It should be assumed there are pending validations and issues. Use `nightly` tag.

```bash
npm install -g @google/gemini-cli@nightly
```

## 📋 Key Features

### Code Understanding & Generation

- Query and edit large codebases
- Generate new apps from PDFs, images, or sketches using multimodal capabilities
- Debug issues and troubleshoot with natural language

### Automation & Integration

- Automate operational tasks like querying pull requests or handling complex rebases
- Use MCP servers to connect new capabilities, including [media generation with Imagen, Veo or Lyria](https://github.com/GoogleCloudPlatform/vertex-ai-creative-studio/tree/main/experiments/mcp-genmedia)
- Run non-interactively in scripts for workflow automation

### Advanced Capabilities

- Ground your queries with built-in [Google Search](https://ai.google.dev/gemini-api/docs/grounding) for real-time information
- Conversation checkpointing to save and resume complex sessions
- Custom context files (GEMINI.md) to tailor behavior for your projects

### GitHub Integration

Integrate Gemini CLI directly into your GitHub workflows with [**Gemini CLI GitHub Action**](https://github.com/google-github-actions/run-gemini-cli):

- **Pull Request Reviews**: Automated code review with contextual feedback and suggestions
- **Issue Triage**: Automated labeling and prioritization of GitHub issues based on content analysis
- **On-demand Assistance**: Mention `@gemini-cli` in issues and pull requests for help with debugging, explanations, or task delegation
- **Custom Workflows**: Build automated, scheduled and on-demand workflows tailored to your team's needs

## 🔐 Authentication Options

Choose the authentication method that best fits your needs:

### Option 1: OAuth login (Using your Google Account)

**✨ Best for:** Individual developers as well as anyone who has a Gemini Code Assist License.

**Benefits:**

- **Free tier**: 60 requests/min and 1,000 requests/day
- **Gemini 2.5 Pro** with 1M token context window
- **No API key management** - just sign in with your Google account
- **Automatic updates** to latest models

#### Start Cortex CLI, then choose OAuth and follow the browser authentication flow when prompted

```bash
cortex
```

#### If you are using a paid Code Assist License from your organization, remember to set the Google Cloud Project

```bash
# Set your Google Cloud Project
export GOOGLE_CLOUD_PROJECT="YOUR_PROJECT_NAME"
cortex
```

### Option 2: Gemini API Key

**✨ Best for:** Developers who need specific model control or paid tier access

**Benefits:**

- **Free tier**: 100 requests/day with Gemini 2.5 Pro
- **Model selection**: Choose specific Gemini models
- **Usage-based billing**: Upgrade for higher limits when needed

```bash
# Get your key from https://aistudio.google.com/apikey
export GEMINI_API_KEY="YOUR_API_KEY"
cortex
```

### Option 3: Vertex AI

**✨ Best for:** Enterprise teams and production workloads

**Benefits:**

- **Enterprise features**: Advanced security and compliance
- **Scalable**: Higher rate limits with billing account
- **Integration**: Works with existing Google Cloud infrastructure

```bash
# Get your key from Google Cloud Console
export GOOGLE_API_KEY="YOUR_API_KEY"
export GOOGLE_GENAI_USE_VERTEXAI=true
cortex
```

### Option 4: Ollama (Local AI)

**✨ Best for:** Privacy-focused developers, local development, and custom models

**Benefits:**

- **Complete privacy**: All processing happens locally
- **No API costs**: Free to use with your own hardware
- **Custom models**: Use any model supported by Ollama
- **Offline capable**: Works without internet connection

```bash
# Install Ollama first: https://ollama.ai/
# Then pull a model (e.g., llama2, codellama, etc.)
ollama pull llama2

# Start Ollama server
ollama serve

# Use with Cortex CLI
export CORTEX_AUTH_TYPE=ollama
export OLLAMA_BASE_URL=http://localhost:11434  # optional
cortex -m llama2
```

For Google Workspace accounts and other authentication methods, see the [authentication guide](./docs/cli/authentication.md).

## 🚀 Getting Started

### Basic Usage

#### Start in current directory

```bash
cortex
```

#### Include multiple directories

```bash
cortex --include-directories ../lib,../docs
```

#### Use specific model

```bash
cortex -m gemini-2.5-flash
# Or use Ollama model
cortex -m llama2
```

#### Non-interactive mode for scripts

```bash
cortex -p "Explain the architecture of this codebase"
```

### Quick Examples

#### Start a new project

```bash
cd new-project/
cortex
> Write me a Discord bot that answers questions using a FAQ.md file I will provide
```

#### Analyze existing code

```bash
git clone https://github.com/MarkCodering/cortex-cli
cd cortex-cli
cortex
> Give me a summary of all of the changes that went in yesterday
```

#### Using Ollama for local AI

```bash
# Make sure Ollama is running locally
ollama serve

# In another terminal, use Cortex CLI with Ollama
export CORTEX_AUTH_TYPE=ollama
export OLLAMA_BASE_URL=http://localhost:11434  # optional, this is the default
cortex -m llama2
> Help me refactor this function to be more efficient
```

## 📚 Documentation

### Getting Started

- [**Quickstart Guide**](./docs/cli/index.md) - Get up and running quickly
- [**Authentication Setup**](./docs/cli/authentication.md) - Detailed auth configuration
- [**Configuration Guide**](./docs/cli/configuration.md) - Settings and customization
- [**Keyboard Shortcuts**](./docs/keyboard-shortcuts.md) - Productivity tips

### Core Features

- [**Commands Reference**](./docs/cli/commands.md) - All slash commands (`/help`, `/chat`, `/mcp`, etc.)
- [**Checkpointing**](./docs/checkpointing.md) - Save and resume conversations
- [**Memory Management**](./docs/tools/memory.md) - Using GEMINI.md context files
- [**Token Caching**](./docs/cli/token-caching.md) - Optimize token usage

### Tools & Extensions

- [**Built-in Tools Overview**](./docs/tools/index.md)
  - [File System Operations](./docs/tools/file-system.md)
  - [Shell Commands](./docs/tools/shell.md)
  - [Web Fetch & Search](./docs/tools/web-fetch.md)
  - [Multi-file Operations](./docs/tools/multi-file.md)
- [**MCP Server Integration**](./docs/tools/mcp-server.md) - Extend with custom tools
- [**Custom Extensions**](./docs/extension.md) - Build your own commands

### Advanced Topics

- [**Architecture Overview**](./docs/architecture.md) - How Gemini CLI works
- [**IDE Integration**](./docs/ide-integration.md) - VS Code companion
- [**Sandboxing & Security**](./docs/sandbox.md) - Safe execution environments
- [**Enterprise Deployment**](./docs/deployment.md) - Docker, system-wide config
- [**Telemetry & Monitoring**](./docs/telemetry.md) - Usage tracking
- [**Tools API Development**](./docs/core/tools-api.md) - Create custom tools

### Configuration & Customization

- [**Settings Reference**](./docs/cli/configuration.md) - All configuration options
- [**Theme Customization**](./docs/cli/themes.md) - Visual customization
- [**.gemini Directory**](./docs/gemini-ignore.md) - Project-specific settings
- [**Environment Variables**](./docs/cli/configuration.md#environment-variables)

### Troubleshooting & Support

- [**Troubleshooting Guide**](./docs/troubleshooting.md) - Common issues and solutions
- [**FAQ**](./docs/troubleshooting.md#frequently-asked-questions) - Quick answers
- Use `/bug` command to report issues directly from the CLI

### Using MCP Servers

Configure MCP servers in `~/.gemini/settings.json` to extend Gemini CLI with custom tools:

```text
> @github List my open pull requests
> @slack Send a summary of today's commits to #dev channel
> @database Run a query to find inactive users
```

See the [MCP Server Integration guide](./docs/tools/mcp-server.md) for setup instructions.

## 🤝 Contributing

We welcome contributions! Cortex CLI is fully open source (Apache 2.0), forked from Google's Gemini CLI, and we encourage the community to:

- Report bugs and suggest features
- Improve documentation
- Submit code improvements
- Share your MCP servers and extensions
- Add support for additional AI providers

See our [Contributing Guide](./CONTRIBUTING.md) for development setup, coding standards, and how to submit pull requests.

## 📖 Resources

- **[GitHub Repository](https://github.com/MarkCodering/cortex-cli)** - Source code and issues
- **[Original Gemini CLI](https://github.com/google-gemini/gemini-cli)** - Upstream project
- **[Ollama](https://ollama.ai/)** - Local AI model runner

### Uninstall

See the [Uninstall Guide](docs/Uninstall.md) for removal instructions.

## 📄 Legal

- **License**: [Apache License 2.0](LICENSE)
- **Original**: Forked from Google's Gemini CLI
- **Terms of Service**: [Terms & Privacy](./docs/tos-privacy.md)
- **Security**: [Security Policy](SECURITY.md)

---

<p align="center">
  Built with ❤️ by the community, forked from Google's Gemini CLI
</p>
