# Implementation Plan: VitePress to Astro Migration

**Branch**: `001-vitepress-to-astro-migration` | **Date**: 2025-10-24 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-vitepress-to-astro-migration/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Migrate existing VitePress blog to Astro framework while preserving content, maintaining deployment simplicity, and improving performance. The migration includes content migration, theme conversion, Cloudflare integration, and automated deployment processes.

## Technical Context

**Language/Version**: TypeScript 5.0+ (for Astro compatibility)  
**Primary Dependencies**: Astro 4.x, astrojs compiler, Markdown processing libraries  
**Storage**: Static content files with Cloudflare R2 for media assets  
**Testing**: Vitest for unit tests, Playwright for E2E tests  
**Target Platform**: Web application (SSG - Static Site Generation) with Cloudflare Pages deployment
**Project Type**: Web/single project - Astro-based static site  
**Performance Goals**: < 100ms LCP, < 30ms FID, 90+ PageSpeed score, zero-JS approach where possible  
**Constraints**: Must preserve existing URLs, maintain Markdown-first workflow, ensure < 2MB bundle size  
**Scale/Scope**: Personal blog site with ~100 content files, moderate traffic, SEO-focused

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Based on the scx-blog Constitution, this plan must comply with:

1. Maintainable Migration: Must preserve existing Markdown content and frontmatter
2. Lightweight Architecture: Must leverage Astro's zero-JS approach and optimize for performance
3. Markdown-First Workflow: Must accommodate existing Markdown authoring workflow
4. Progressive Enhancement: Must ensure core content delivery works without JavaScript
5. Infrastructure Simplicity: Must use Cloudflare Pages + R2 for simple, cost-effective deployment

## Project Structure

### Documentation (this feature)

```text
specs/001-vitepress-to-astro-migration/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── components/
├── layouts/
├── pages/
├── styles/
└── content/
    ├── blog/
    └── config.ts

public/
├── images/
└── assets/

package.json
astro.config.mjs
tsconfig.json
```

**Structure Decision**: Single web application structure with Astro-specific directories (src/pages for routing, src/layouts for templates, src/content for markdown content). Content files will be migrated from VitePress format to Astro content collections.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| (none) | | |
