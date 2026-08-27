# MedExplain AI — Component Reference & Custom Hooks

Detailed documentation of React components, props interfaces, and custom hooks.

---

## 1. Custom Hooks

### `useAnalysis` (`src/hooks/useAnalysis.ts`)
Manages lab analysis state and coordinates evaluation.
- `analyze(values, patient, previousValues)`: Validates form input, executes clinical evaluation, synergy matching, and trend calculations.
- `analyzeDirect(numericValues, patient, previousValues)`: Bypasses string parsing for instant 1-click patient scenario loading.
- `result`: The active `AnalysisResult` object.
- `errors`: Array of validation error strings.

### `useLocalHistory` (`src/hooks/useLocalHistory.ts`)
Manages browser-side history in `localStorage`.
- `items`: Array of saved `AnalysisResult` items.
- `enabled`: Boolean flag indicating if local persistence is active.
- `save(result)`: Appends an analysis result to local history.
- `remove(id)`: Deletes an individual history entry.
- `clearAll()`: Wipes all saved history entries.

### `useTheme` (`src/hooks/useTheme.ts`)
Controls Light / Dark mode.
- `theme`: `'light' | 'dark'`
- `toggleTheme()`: Toggles state and sets `document.documentElement.setAttribute('data-theme', theme)`.

---

## 2. Key Components

### `ChatbotDrawer.tsx` (`src/components/Chatbot/ChatbotDrawer.tsx`)
- Floating/docked chat modal window with markdown rendering, suggested contextual prompts, API key settings panel, interactive key testing, and 1-click message copy.

### `ChatLauncher.tsx` (`src/components/Chatbot/ChatLauncher.tsx`)
- Fixed floating action pill at bottom-left corner with status sparkle, unread badge, and mobile safe-area alignment.

### `AiInsightsCard.tsx` (`src/components/AiInsightsCard.tsx`)
- Collapsible AI narrative clinical synthesis card positioned at the top of ResultsPage.

### `RangeGauge.tsx` (`src/components/RangeGauge.tsx`)
- Visual horizontal biomarker bar with color zones (Normal, Warning, Danger), LTR coordinate track, numeric boundary ticks, and indicator pin.

### `ResultCard.tsx` (`src/components/ResultCard.tsx`)
- Card for each biomarker with RangeGauge, educational descriptions ("מה המדד בודק"), safe explanation, possible physiological reasons, and doctor visit questions.

### `VisitBriefPage.tsx` (`src/pages/VisitBriefPage.tsx`)
- Dedicated doctor preparation sheet with printable A4 layout, interactive checklist, ranked questions, and doctor note lines.

