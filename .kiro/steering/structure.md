# Project Structure

## Root Level Files
- `App.tsx` - Main application component with page routing and state management
- `StyleGuideApp.tsx` - Alternative app entry point with comprehensive UI
- `index.tsx` - React app entry point
- `types.ts` - Global TypeScript interfaces and types
- `constants.ts` - Application constants (survey sections, questions)

## Folder Organization

### `/components`
UI components following single responsibility principle:
- `AnalysisForm.tsx` - Survey form component
- `AnalysisPage.tsx` - Main analysis interface
- `ChatPage.tsx` - Chat interface component
- `Header.tsx` - Navigation header
- `ImageUploader.tsx` - File upload component
- `Loader.tsx` - Loading state component
- `SummaryDisplay.tsx` - Results display component

### `/services`
External API and AI service integrations:
- `geminiService.ts` - Google Gemini API integration
- `kibbeData.ts` - Kibbe methodology data and constants
- `localRag.ts` - Local RAG implementation for chat

### `/utils`
Utility functions and helpers:
- `env.ts` - Environment variable handling
- `kibbe.ts` - Kibbe type calculation logic

## Naming Conventions
- **Components**: PascalCase (e.g., `AnalysisPage.tsx`)
- **Services**: camelCase with descriptive suffixes (e.g., `geminiService.ts`)
- **Types**: PascalCase interfaces (e.g., `AnalysisResult`)
- **Constants**: UPPER_SNAKE_CASE for data, camelCase for objects

## File Patterns
- Components export default React.FC
- Services export named functions
- Types defined in dedicated `types.ts` or inline when component-specific
- CSS classes follow BEM-like methodology in `styleguide.css`