## Project Rules and Scalable Architecture

This document defines the folder structure, naming conventions, and development rules for a scalable Next.js (App Router) codebase. It consolidates and streamlines guidance from `development/foldersDemo.md` and `development/FOLDER_STRUCTURE.md` and adds opinionated rules for helpers, store, and lib organization.

### Goals
- Ensure consistent, discoverable folder structure
- Keep business logic organized and reusable
- Enable easy scaling across domains/features
- Standardize error handling, logging, and API access

---

## Source Layout

All source code lives under `src/`.

```
src/
  app/                 # Next.js App Router (routes, layouts, pages)
  components/          # Reusable UI components (incl. shadcn/ui under components/ui)
  hooks/               # Reusable React hooks
  lib/                 # Library code, framework-agnostic utilities, API clients, config
  store/               # App state (Zustand or others) organized by domain
  helpers/             # High-level helper functions (API wrappers, form utils, error helpers)
  constants/           # Constants: messages, routes, enums, SWR keys
  types/               # Shared TypeScript types/interfaces (if/when needed)
  utils/               # Simple pure utilities (string/date/number helpers)
  styles/              # Global styles
```

### Import Alias
TypeScript `paths` must map `@/*` to `src/*`.

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

Examples:
- `@/components/*` → `src/components/*`
- `@/hooks/*` → `src/hooks/*`
- `@/lib/*` → `src/lib/*`
- `@/store/*` → `src/store/*`
- `@/helpers/*` → `src/helpers/*`
- `@/constants/*` → `src/constants/*`

---

## Naming Conventions

- **Folders**: lowercase-with-hyphens
- **Components**: `PascalCase` (e.g., `ProjectSidebar.tsx`)
- **Hooks**: `use[Feature]-hook.ts` (e.g., `useLearners-hook.ts`)
- **Zustand stores**: `[entity]-store.ts` (e.g., `learner-store.ts`)
- **API modules**: `[entity].ts` (e.g., `learners.ts`)
- **Constants files**: `string-const.ts`, `swr-keys.ts`, `routes.ts`, or grouped per domain

Barrel exports are encouraged for clean imports:

```
src/hooks/pages/admin/index.ts
src/lib/api/pages/admin/index.ts
src/store/pages/admin/index.ts
src/helpers/index.ts
src/constants/index.ts
```

---

## Scalable Domain Structure (Admin Example)

Follow the `pages` namespace pattern for domain-specific code under `components`, `hooks`, `lib/api`, and `store`.

```
src/
  components/pages/admin/
    learners/
    organizations/
    trainers/
    users/
  hooks/pages/admin/
    learners/
    organizations/
    trainers/
    users/
  lib/api/pages/admin/
    learners.ts
    organizations.ts
    trainers.ts
    users.ts
  store/pages/admin/
    learners/
    organizations/
    trainers/
    users/
```

### Import Path Standards

```typescript
// ✅ Preferred
import { useAdminLearners } from '@/hooks/pages/admin'
import * as learnersApi from '@/lib/api/pages/admin/learners'
import { useLearnersStore } from '@/store/pages/admin/learners/learner-store'

// ❌ Avoid legacy/ambiguous
// import { useAdminLearners } from '@/hooks/admin'
// import * as learnersApi from '@/lib/api/admin/learners'
```

---

## Helpers vs Lib vs Utils

- **`helpers/`**: High-level, app-aware helpers that coordinate concerns (e.g., `handleError`, `apiRequest`, form helpers). Can depend on `constants/` and `utils/`.
- **`lib/`**: Low-level, framework-agnostic libraries (e.g., API clients, analytics, config, adapters). Avoid importing app state from here.
- **`utils/`**: Small, pure, reusable functions (no side effects, no I/O). Example: string/date/array helpers.

Recommended structure:

```
src/
  helpers/
    errors.ts            # handleError, error mappers
    request.ts           # apiRequest wrapper (fetch/axios), interceptors
    form-utils.ts        # zod/yup schemas, common resolvers
  lib/
    api/
      pages/
        admin/
          learners.ts
          trainers.ts
        public/
          leads.ts
    config/
      env.ts
      swr.ts
    http/
      client.ts          # Underlying HTTP client creation
  constants/
    api-endpoints.ts
    string-const.ts
    swr-keys.ts
    routes.ts
  utils/
    dates.ts
    strings.ts
    arrays.ts
```

---

## State Management Rules

### SWR for Data Fetching
- Use SWR for all remote data with proper error handling and cache keys
- Disable unnecessary focus revalidation for heavy lists

```typescript
import useSWR from 'swr'
import { SWR_KEYS } from '@/constants/swr-keys'
import * as learnersApi from '@/lib/api/pages/admin/learners'
import { useLearnersStore } from '@/store/pages/admin/learners/learner-store'
import { handleError } from '@/helpers/errors'

export function useAdminLearners() {
  const store = useLearnersStore()

  const { data, error, isLoading, mutate } = useSWR(
    SWR_KEYS.LEARNERS,
    async () => {
      try {
        store.setLoading(true)
        store.setError(null)
        const learners = await learnersApi.getAllLearnerProfiles()
        store.setLearners(learners)
        return learners
      } catch (err) {
        handleError(err)
        throw err
      } finally {
        store.setLoading(false)
      }
    },
    { revalidateOnFocus: false, revalidateOnReconnect: true, shouldRetryOnError: false }
  )

  return { learners: data ?? [], error, isLoading, mutate }
}
```

### Zustand for Local/Global State

```typescript
import { create } from 'zustand'

interface LearnersStore {
  learners: any[]
  isLoading: boolean
  isSubmitting: boolean
  error: string | null
  setLearners: (list: any[]) => void
  addLearner: (item: any) => void
  updateLearner: (id: string, updates: Partial<any>) => void
  removeLearner: (id: string) => void
  setLoading: (v: boolean) => void
  setSubmitting: (v: boolean) => void
  setError: (v: string | null) => void
}

export const useLearnersStore = create<LearnersStore>((set) => ({
  learners: [],
  isLoading: false,
  isSubmitting: false,
  error: null,
  setLearners: (learners) => set({ learners }),
  addLearner: (learner) => set((s) => ({ learners: [learner, ...s.learners] })),
  updateLearner: (id, updates) => set((s) => ({
    learners: s.learners.map((l) => (l.id === id ? { ...l, ...updates } : l)),
  })),
  removeLearner: (id) => set((s) => ({ learners: s.learners.filter((l) => l.id !== id) })),
  setLoading: (v) => set({ isLoading: v }),
  setSubmitting: (v) => set({ isSubmitting: v }),
  setError: (v) => set({ error: v }),
}))
```

Barrel export example:

```
// src/store/pages/admin/index.ts
export { useLearnersStore } from './learners/learner-store'
```

---

## API Integration Rules

- All API calls go through `helpers/request.ts` (`apiRequest`) to centralize errors, headers, and interceptors.
- Define endpoints and keys in `constants/`.
- Use strict typing on request/response.

```typescript
// helpers/request.ts
import axios from 'axios'

export const apiRequest = axios.create({ baseURL: '/api' })
```

```typescript
// lib/api/pages/admin/learners.ts
import { apiRequest } from '@/helpers/request'

export interface LearnerProfile { id: string; email: string; first_name?: string }

export const getAllLearnerProfiles = async (): Promise<LearnerProfile[]> => {
  const { data } = await apiRequest.get('/learners')
  return data
}
```

SWR keys:

```typescript
// constants/swr-keys.ts
export const SWR_KEYS = {
  LEARNERS: 'learners',
  LEARNERS_WITH_PARAMS: (p: unknown) => ['learners', p],
}
```

---

## Logging Standards

- Use emoji prefixes for clarity: 🔵 context, ❌ error, ✅ success
- Include structured context in logs

```typescript
console.log('🔵 [TrainersClient] rendering')
console.log('🔴 [DEACTIVATE] trainerId:', trainer.id)
console.error('❌ [useAdminTrainers] fetch failed:', error)
console.log('✅ [SUCCESS] trainer deactivated')
```

---

## Error Handling

- Centralize with `helpers/errors.ts` (`handleError`)
- Show user-friendly toasts; map status codes where helpful

```typescript
try {
  const data = await apiRequest.get('/endpoint')
  return data
} catch (err: any) {
  console.error('❌ [API] Error:', err)
  // toast by status
  // toast.error('Server error. Please try again later.')
  // toast.error('Resource not found')
  // toast.error('An error occurred. Please try again.')
  // handleError(err)
  throw err
}
```

---

## Component Development

- Prefer `React.memo` for heavy components
- Strict typing for props and state
- Provide loading and error states

```typescript
const TrainersClient = React.memo(function TrainersClient() {
  const { trainers, isLoading, error } = useAdminTrainers()
  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage error={String(error)} />
  return <div>{/* content */}</div>
})
```

---

## Forms

- Validate with schema (e.g., zod/yup) via `helpers/form-utils`
- Track submission state; surface errors

```typescript
const [isSubmitting, setIsSubmitting] = useState(false)
const handleSubmit = async (formData: any) => {
  try {
    setIsSubmitting(true)
    await createTrainer(formData)
    // toast.success(...)
  } catch (err) {
    // handleError(err)
  } finally {
    setIsSubmitting(false)
  }
}
```

---

## Performance

- Use `useCallback` for handlers; `useMemo` for heavy computations
- Configure SWR cache keys properly; use optimistic updates

```typescript
const stats = useMemo(() => computeStats(trainers), [trainers])

const addLearner = async (learnerData: any) => {
  const optimistic = { id: 'temp', ...learnerData }
  mutate((prev) => [optimistic, ...(prev ?? [])], false)
  try {
    const created = await createLearnerAPI(learnerData)
    mutate((prev) => prev?.map((l) => (l.id === 'temp' ? created : l)))
  } catch {
    mutate() // revert
  }
}
```

---

## Barrel Exports and Types

- Export hooks, API, and stores via `index.ts` per domain
- Co-locate simple interfaces with their usage; move shared types to `types/`

```typescript
// src/hooks/pages/admin/index.ts
export { useAdminLearners } from './learners/useLearners-hook'
export { useAdminOrganizations } from './organizations/useOrganizations-hook'
export { useAdminTrainers } from './trainers/useTrainers-hook'
export { useAdminUsers } from './users/useUsers-hook'
```

---

## Route, String, and Key Constants

Keep central and consistent:

```typescript
// constants/string-const.ts
export const API_MESSAGES = {
  LEARNER_ADDED_SUCCESS: 'Learner added successfully',
}

// constants/routes.ts
export const ROUTES = {
  learnerDetails: (id: string) => `/admin/learners/${id}`,
}
```

Usage examples:

```tsx
toast.success(API_MESSAGES.LEARNER_ADDED_SUCCESS)
<Link href={ROUTES.learnerDetails(id)}>
```

---

## Migration and Refactoring Guidelines

When adding a new admin feature:
1. Create folders under `components/pages/admin`, `hooks/pages/admin`, `lib/api/pages/admin`, and `store/pages/admin`
2. Implement hooks using SWR + Zustand pattern
3. Add API functions with strict typing and centralized `apiRequest`
4. Export from barrel `index.ts`
5. Add constants and update existing enums/keys
6. Provide loading/error states and optimistic updates where appropriate

When refactoring existing code:
1. Align with the structure and naming rules above
2. Update imports to use `@/` and barrel exports
3. Maintain backward compatibility as needed
4. Update documentation/comments as required
5. Test affected functionality thoroughly

---

## Quick Checklists

- **Structure**: Is code inside `src/` and placed by domain?
- **Imports**: Using `@/` alias and barrel exports?
- **State**: SWR for data, Zustand for complex state?
- **Errors**: Centralized via `helpers/errors` and user-friendly toasts?
- **Logging**: Emoji-tagged logs with context?
- **Performance**: Memoization where needed, SWR keys consistent?
- **Consistency**: Naming conventions and folder structure respected?

This rule set ensures a consistent, maintainable, and scalable codebase as the app grows.


