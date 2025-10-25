---
description: "Task list for VitePress to Astro Migration"
---

# Tasks: VitePress to Astro Migration

**Input**: Design documents from `/specs/001-vitepress-to-astro-migration/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/
**Generated**: 2025-10-24

**Tests**: Test tasks included as requested in feature specification.
**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `public/`, `package.json`, `astro.config.mjs`, etc. at repository root
- Paths shown below assume single project - adjust based on plan.md structure

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create project structure per implementation plan in src/, public/, and root level files
- [X] T002 [P] Initialize Astro project with TypeScript 5.x dependencies in package.json
- [X] T003 [P] Configure linting and formatting tools (ESLint, Prettier) for Astro project
- [X] T004 Create initial tsconfig.json with Astro configuration
- [X] T005 [P] Setup basic Astro configuration in astro.config.mjs

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T006 Setup Astro content collections configuration per data-model.md in src/content/config.ts
- [X] T007 [P] Create content collection schemas for blog and pages as defined in data-model.md
- [X] T008 Create base layout components structure in src/layouts/
- [X] T009 Setup routing structure in src/pages/ with index.astro
- [X] T010 Setup asset handling and static file serving in public/ directory
- [X] T011 Configure build process to output to dist/ directory
- [X] T012 Setup environment configuration for different deployment stages

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Content Migration (Priority: P1) 🎯 MVP

**Goal**: Migrate existing VitePress markdown files to Astro content collections while preserving all content and frontmatter

**Independent Test**: Content files can be successfully read by Astro and displayed at the same URLs as the original VitePress site.

### Implementation for User Story 1

- [X] T013 [P] [US1] Create content migration script in scripts/migrate-content.mjs
- [X] T014 [P] [US1] Set up source directory mapping from ./docs/ to ./src/content/blog/
- [X] T015 [US1] Implement frontmatter transformation logic (title→title, description→summary, date→pubDate)
- [X] T016 [US1] Create content validation functions to check required fields per data-model.md
- [X] T017 [US1] Migrate all existing VitePress markdown files to Astro content collections
- [X] T018 [US1] Update URL routing to preserve existing URLs for SEO purposes
- [X] T019 [P] [US1] Create content migration status reporting in migration-result.json

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Theme Conversion (Priority: P2)

**Goal**: Recreate layouts using Astro components with a modern, lightweight design that matches original VitePress theme

**Independent Test**: A user visiting the site after migration cannot tell the difference in presentation between the old and new sites.

### Implementation for User Story 2

- [ ] T020 [P] [US2] Create base layout component in src/layouts/BaseLayout.astro
- [ ] T021 [P] [US2] Create blog post layout component in src/layouts/BlogPostLayout.astro
- [ ] T022 [P] [US2] Create blog list layout component in src/layouts/BlogListLayout.astro
- [ ] T023 [US2] Implement header component with navigation in src/components/Header.astro
- [ ] T024 [US2] Implement footer component in src/components/Footer.astro
- [ ] T025 [US2] Create post card component for listing in src/components/PostCard.astro
- [ ] T026 [US2] Implement styling that matches original VitePress theme in src/styles/
- [ ] T027 [US2] Create responsive layout that works across device sizes
- [ ] T028 [US2] Implement navigation that functions the same as in VitePress

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Cloudflare Integration (Priority: P3)

**Goal**: Configure deployment to Cloudflare Pages with R2 for asset storage

**Independent Test**: The application builds successfully on Cloudflare Pages and assets are properly served from R2.

### Implementation for User Story 3

- [ ] T029 Create wrangler.toml configuration file for Cloudflare R2 integration
- [ ] T030 [P] [US3] Set up environment variables for Cloudflare deployment in .env
- [ ] T031 [US3] Implement R2 asset upload utility in utils/r2Uploader.ts
- [ ] T032 [US3] Configure Cloudflare Pages deployment settings
- [ ] T033 [US3] Update build configuration for Cloudflare Pages compatibility
- [ ] T034 [US3] Test asset uploading and retrieval from R2
- [ ] T035 [US3] Create Cloudflare-specific configuration in cloudflare.config.js

**Checkpoint**: At this point, User Stories 1, 2 AND 3 should all work independently

---

## Phase 6: User Story 4 - Automation and CI/CD (Priority: P4)

**Goal**: Create GitHub Actions workflow for automated builds and deployments

**Independent Test**: A commit to the main branch triggers the GitHub Action which builds and deploys the site successfully.

### Implementation for User Story 4

- [ ] T036 Create GitHub Actions workflow for build and deployment in .github/workflows/deploy.yml
- [ ] T037 [P] [US4] Configure build steps for Astro project in deploy.yml
- [ ] T038 [US4] Set up deployment to Cloudflare Pages in deploy.yml
- [ ] T039 [US4] Configure error notification system for failed builds in deploy.yml
- [ ] T040 [US4] Test automated deployment workflow with test branch

**Checkpoint**: At this point, User Stories 1-4 should all work independently

---

## Phase 7: User Story 5 - Testing and Verification (Priority: P5)

**Goal**: Implement comprehensive testing to validate functionality and performance

**Independent Test**: A comprehensive test report validates that all functionality works as expected.

### Tests for User Story 5 (OPTIONAL - only if tests requested) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T041 [P] [US5] Create performance test suite using Playwright in tests/performance/
- [ ] T042 [P] [US5] Create functional test suite for content access in tests/functional/
- [ ] T043 [P] [US5] Create accessibility test suite in tests/accessibility/

### Implementation for User Story 5

- [ ] T044 [US5] Run comparison tests between VitePress and Astro versions
- [ ] T045 [US5] Generate performance metrics report (LCP, FID, PageSpeed scores)
- [ ] T046 [US5] Create test report documenting all functionality equivalency
- [ ] T047 [US5] Validate that Astro version meets or exceeds VitePress performance

**Checkpoint**: All user stories should now be independently functional

---

[Add more user story phases as needed, following the same pattern]

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T048 [P] Documentation updates in README.md and docs/
- [ ] T049 Code cleanup and refactoring across all components
- [ ] T050 Performance optimization across all stories
- [ ] T051 [P] Additional unit tests in tests/unit/ if requested
- [ ] T052 Security hardening across all components
- [ ] T053 Run quickstart.md validation to ensure setup works as documented
- [ ] T054 Update package.json with proper metadata and scripts

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3 → P4 → P5)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Depends on US1 (needs content to theme)
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 4 (P4)**: Can start after Foundational (Phase 2) - Depends on US3 (needs deployment setup)
- **User Story 5 (P5)**: Can start after Foundational (Phase 2) - Depends on US1, US2, US3 (needs all functionality for testing)

### Within Each User Story

- Models before services (content schema before content API)
- Services before endpoints (content API before pages that consume it)
- Core implementation before integration
- Story complete before moving to next priority
- Tests (if included) MUST be written and FAIL before implementation

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, user stories can start in parallel if team capacity allows
- All implementation tasks for a user story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 2

```bash
# Launch all components for User Story 2 together:
Task: "Create base layout component in src/layouts/BaseLayout.astro"
Task: "Create blog post layout component in src/layouts/BlogPostLayout.astro"
Task: "Create blog list layout component in src/layouts/BlogListLayout.astro"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add User Story 4 → Test independently → Deploy/Demo
6. Add User Story 5 → Test independently → Deploy/Demo
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
   - Developer D: User Story 4
   - Developer E: User Story 5
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
