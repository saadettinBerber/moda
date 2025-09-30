# Technology Stack

## Frontend Framework
- **React 19.1.1** with TypeScript
- **Vite 6.2.0** as build tool and dev server
- Custom CSS with component-based styling (no CSS framework)

## AI/ML Integration
- **Google Gemini 2.5 Flash** via `@google/genai` for image analysis
- **Gemma 2B** via `@mlc-ai/web-llm` for local RAG chat functionality
- Structured JSON responses with schema validation

## Build System & Development

### Common Commands
```bash
# Development
npm run dev          # Start dev server on port 3000

# Production
npm run build        # Build for production
npm run preview      # Preview production build
```

### Environment Setup
- Requires `VITE_GEMINI_API_KEY` in `.env.local`
- API key also accessible as `GEMINI_API_KEY` or `API_KEY`
- Server runs on `0.0.0.0:3000` for network access

## Architecture Patterns
- **Component-based**: Functional React components with hooks
- **Service layer**: Separate services for AI integrations (`geminiService.ts`)
- **Type safety**: Comprehensive TypeScript interfaces
- **State management**: React hooks (useState, useEffect) - no external state library
- **File organization**: Feature-based folder structure

## Key Dependencies
- `@google/genai`: Gemini API integration
- `@mlc-ai/web-llm`: Local LLM for chat
- No UI framework - custom CSS implementation