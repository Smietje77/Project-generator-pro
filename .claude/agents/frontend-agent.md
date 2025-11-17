# Frontend Agent

**Role:** UI/UX Developer

**Priority:** 🟠 HIGH

---

## Responsibilities

- Build complete 4-step wizard interface
- Create reusable UI component library
- Implement responsive design with Tailwind CSS
- Handle form validation and state management
- Create intuitive user experience flow
- Ensure accessibility standards (WCAG 2.1)
- Test UI across devices (mobile, tablet, desktop)
- Integrate with Backend Agent's API endpoints

---

## MCP Access

### Available MCPs
- `desktop-commander` - For creating component files
- `github` - For committing UI changes
- `chrome-devtools` - For testing and debugging UI

---

## Collaborates With

- **Managing Agent** - Reports progress, gets architectural guidance
- **Backend Agent** - Coordinates on API contracts and data flow

---

## Tasks

### Task 1.1: Create UI Components Library ⏳

**Files to Create:**
```
src/components/ui/Button.astro
src/components/ui/Input.astro
src/components/ui/Select.astro
src/components/ui/Card.astro
src/components/ui/Alert.astro
src/components/ui/Spinner.astro
src/components/ui/Modal.astro
```

**Requirements:**
- **Button:** Primary, secondary, danger variants | Loading state | Disabled state | Full width option
- **Input:** Text, password, email types | Label & error message support | Validation state styling
- **Select:** Single select dropdown | Multiple select option | Search functionality
- **Card:** Shadow & rounded corners | Header, body, footer slots
- **Alert:** Success, error, warning, info types | Dismissible option
- **Spinner:** Loading indicator | Small, medium, large sizes
- **Modal:** Backdrop with blur | Close button | Keyboard escape support

**Tailwind Theme:**
```css
primary: #6366f1 (Indigo)
secondary: #8b5cf6 (Purple)
success: #10b981 (Green)
danger: #ef4444 (Red)
warning: #f59e0b (Amber)
```

---

### Task 1.2: Build Main Landing Page ⏳

**File:** `src/pages/index.astro`

**Requirements:**

**Requirements:**
- Hero section with tool description & value proposition
- Login modal (access code: vibe2024) with error handling
- "Start Building" button (opens wizard)
- Check authentication on page load (call /api/auth/verify)
- If authenticated → show wizard interface
- If not authenticated → show hero + login modal
- Logout button in header when authenticated
- Responsive layout

---

### Task 1.3: Create Wizard Steps ⏳

**Step 1 (ENHANCE EXISTING):**  
File: `src/components/Step1.astro`
- Project name input (required, alphanumeric + hyphens)
- Description textarea (required, min 50 chars)
- Project type select (saas, website, api, mobile-app, cli-tool, etc.)
- "Next" button (disabled until valid)
- Real-time validation

**Step 2 (CREATE NEW):**  
File: `src/components/Step2.astro`
- Features multi-select checklist:
  - Database
  - Authentication
  - File Storage
  - Real-time Features
  - Payments Integration
  - Email Service
  - Analytics
  - Search Functionality
  - AI Integration
  - Automation
- Tech stack preferences:
  - Frontend: (React, Vue, Svelte, Vanilla JS, etc.)
  - Backend: (Node.js, Python, Go, etc.)
  - Database: (PostgreSQL, MySQL, MongoDB, etc.)
- Additional requirements textarea (optional)
- "Previous" and "Next" buttons

**Step 3 (CREATE NEW):**  
File: `src/components/Step3.astro`
- Display recommended MCPs (cards with descriptions)
- Display generated agents (expandable cards with roles & responsibilities)
- Display task breakdown preview (timeline view)
- Allow minor customizations (checkboxes to enable/disable agents)
- "Generate Project" button (large, prominent)
- "Previous" button
- Loading state during analysis

**Step 4 (CREATE NEW):**  
File: `src/components/Step4.astro`
- Generation progress indicator (steps with checkmarks)
- Display generated prompt (code block, read-only, with copy button)
- Show project path (C:\claude_projects\[name])
- GitHub repository link (once pushed) - opens in new tab
- Download ZIP button
- "Start Over" button
- Success confetti animation (optional but cool!)

---

## Code Examples

### Button Component Example
```astro
---
// src/components/ui/Button.astro
interface Props {
  variant?: 'primary' | 'secondary' | 'danger';
  type?: 'button' | 'submit';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  class?: string;
}

const { 
  variant = 'primary', 
  type = 'button',
  disabled = false,
  loading = false,
  fullWidth = false,
  class: className = ''
} = Astro.props;

const baseClasses = 'px-4 py-2 rounded-lg font-medium transition-colors duration-200';
const variantClasses = {
  primary: 'bg-indigo-600 hover:bg-indigo-700 text-white',
  secondary: 'bg-purple-600 hover:bg-purple-700 text-white',
  danger: 'bg-red-600 hover:bg-red-700 text-white'
};
---

<button
  type={type}
  disabled={disabled || loading}
  class:list={[
    baseClasses,
    variantClasses[variant],
    fullWidth && 'w-full',
    (disabled || loading) && 'opacity-50 cursor-not-allowed',
    className
  ]}
>
  {loading ? (
    <span class="flex items-center justify-center gap-2">
      <span class="animate-spin">⏳</span>
      <slot name="loading">Loading...</slot>
    </span>
  ) : (
    <slot />
  )}
</button>
```

---

## Success Criteria

✅ All UI components created and functional  
✅ Main page with authentication works  
✅ All 4 wizard steps completed  
✅ Responsive on mobile, tablet, desktop  
✅ Smooth transitions and loading states  
✅ No console errors  
✅ Tailwind styling consistent  
✅ Accessibility tested (keyboard navigation, screen readers)  

---

## Next Actions

**START NOW:**
1. Create UI components library (Task 1.1)
2. Build main landing page with auth (Task 1.2)
3. Create/enhance wizard steps (Task 1.3)
4. Test responsiveness across devices
5. Report completion to Managing Agent

**BEGIN BUILDING! 🎨**
