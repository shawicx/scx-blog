# Research: VitePress to Astro Migration

## Decision: Astro as the Migration Target
**Rationale**: Astro was selected as the target framework because it aligns with all constitutional principles: it supports the Markdown-first workflow, enables lightweight architecture through its zero-JS approach, and allows for maintainable migration of content.

## VitePress to Astro Migration Patterns

### Content Migration Strategy
**Decision**: Use Astro's content collections to manage Markdown files with frontmatter
**Rationale**: Astro content collections provide type safety and a structured approach to content management that preserves the existing Markdown workflow while offering better performance than VitePress.
**Alternatives considered**: 
- Continue with VitePress (rejected due to performance limitations)
- Migrate to Next.js (rejected due to complexity and SSR overhead)
- Migrate to vanilla HTML/CSS (rejected due to loss of dynamic capabilities)

### Theme and Layout Conversion
**Decision**: Recreate layouts using Astro components with a modern, lightweight design
**Rationale**: Astro's component system allows for efficient static generation while maintaining the look and feel of the original site.
**Alternatives considered**:
- Direct VitePress theme conversion (too complex, not supported)
- Using existing Astro themes (doesn't preserve original look)

### URL Structure Preservation
**Decision**: Maintain existing URL structure using Astro's file-based routing
**Rationale**: Astro's page routing system matches VitePress's approach, making URL preservation straightforward.
**Alternatives considered**:
- New URL structure (rejected due to SEO impact)
- Redirect system (unnecessary complexity for this case)

## Technology Stack Research

### Astro Configuration
**Decision**: Use Astro with minimal integrations to maintain lightweight architecture
**Rationale**: Following the constitutional lightweight principle, only essential integrations (markdown, syntax highlighting) will be included.
**Alternatives considered**:
- Full-featured Astro setup with many integrations (violates lightweight principle)
- Custom build system (violates simplicity principle)

### Deployment Strategy
**Decision**: Deploy to Cloudflare Pages with R2 for asset storage
**Rationale**: This aligns with the infrastructure simplicity principle and provides cost-effective, fast global delivery.
**Alternatives considered**:
- Vercel (more complex configuration based on index.md notes)
- Netlify (similar performance to Cloudflare)
- Self-hosting (violates simplicity principle)

### Build and CI/CD Process
**Decision**: Use GitHub Actions for automated builds and deployments
**Rationale**: Provides integration with GitHub workflow and allows for complete automation.
**Alternatives considered**:
- Cloudflare's native CI (less flexibility)
- Third-party CI services (additional complexity)

## Key Findings

### Content Migration Process
- Astro supports direct import of Markdown files with frontmatter
- Content collections provide better type safety than VitePress
- Need to convert any VitePress-specific markdown syntax to standard markdown or Astro components

### Performance Gains
- Astro's zero-JS approach should significantly improve performance
- Static generation means faster loading times
- Optimized build process compared to VitePress

## Remaining Unknowns (Resolved)

All previously identified "NEEDS CLARIFICATION" items from the technical context have been resolved through this research:

1. Language/Version: Using TypeScript 5.0+ with Astro 4.x
2. Primary Dependencies: Astro core with minimal additional integrations
3. Storage: Static files with R2 for media assets
4. Testing: Vitest for unit testing, Playwright for E2E testing
5. Performance Goals: Achievable with Astro's architecture
6. Constraints: All manageable within Astro framework