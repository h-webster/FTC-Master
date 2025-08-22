# FTC-Master Source Code Organization

This document describes the organization of the source code after refactoring to improve maintainability and reduce file sizes.

## File Structure

```
src/
├── Components/           # React components
│   ├── index.js         # Component exports
│   ├── TeamEntryForm.jsx    # Team search form
│   ├── TeamEntryForm.css    # Form styles
│   ├── TeamDashboard.jsx    # Main dashboard
│   ├── TeamDashboard.css    # Dashboard styles
│   ├── TeamStats.jsx        # Team statistics
│   ├── TeamStats.css        # Stats styles
│   ├── TeamCharts.jsx       # Charts and graphs
│   ├── TeamCharts.css       # Chart styles
│   ├── SimpleStatTooltip.jsx # Tooltip component
│   ├── LoadingScreen.jsx    # Loading screen
│   ├── Matches.jsx          # Match results
│   └── LineGraph.jsx        # Line graph component
├── hooks/               # Custom React hooks
│   └── useTeamData.js   # Team data management
├── utils/               # Utility functions
│   └── teamValidation.js # Team validation logic
├── App.jsx              # Main app component (simplified)
├── App.css              # Global styles only
└── ...                  # Other existing files
```

## Component Breakdown

### TeamEntryForm
- Handles team search input and autocomplete
- Manages search results display
- Handles form submission

### TeamDashboard
- Main container for team performance display
- Orchestrates other components
- Manages layout and structure

### TeamStats
- Displays team statistics and metrics
- Handles tooltips for additional information
- Shows role predictions and matchup advantages

### TeamCharts
- Manages all chart components
- Handles win/loss ratio pie chart
- Integrates with LineGraph component

### SimpleStatTooltip
- Reusable tooltip component
- Supports multiple positions
- Handles hover interactions

## Custom Hooks

### useTeamData
- Manages team data fetching and caching
- Handles MongoDB integration
- Manages loading states and error handling

## Utility Functions

### teamValidation
- Validates team numbers against FTC API
- Handles GraphQL queries
- Returns boolean validation results

## Benefits of This Organization

1. **Smaller Files**: Each component is focused and manageable
2. **Better Maintainability**: Easier to find and modify specific functionality
3. **Reusability**: Components can be easily reused in other parts of the app
4. **Separation of Concerns**: Each file has a single responsibility
5. **Easier Testing**: Smaller components are easier to test individually
6. **Better Collaboration**: Multiple developers can work on different components simultaneously

## Import Examples

```javascript
// Import individual components
import { TeamEntryForm } from './Components/TeamEntryForm';
import { TeamDashboard } from './Components/TeamDashboard';

// Import from index file
import { TeamEntryForm, TeamDashboard } from './Components';

// Import custom hooks
import { useTeamData } from './hooks/useTeamData';

// Import utilities
import { isValidTeamNumber } from './utils/teamValidation';
```

## CSS Organization

- **App.css**: Global styles and shared utilities
- **Component-specific CSS**: Each component has its own CSS file
- **Responsive Design**: Media queries are included in component CSS files
- **Consistent Naming**: CSS classes follow BEM-like naming conventions
