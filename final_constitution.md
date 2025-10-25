<!--
SYNC IMPACT REPORT
Version change: N/A (Initial version) → 1.0.0
List of modified principles: N/A (Initial version)
Added sections: All sections (Initial version)
Removed sections: None
Templates requiring updates:
- ✅ .specify/templates/plan-template.md - Constitution Check section exists but doesn't reference specific principles, no changes needed
- ✅ .specify/templates/spec-template.md - No direct references to constitution principles, no changes needed
- ✅ .specify/templates/tasks-template.md - No direct references to constitution principles, no changes needed
- ✅ .specify/templates/agent-file-template.md - No direct references to constitution, no changes needed
- ✅ .specify/templates/checklist-template.md - No direct references to constitution, no changes needed
Follow-up TODOs: None
-->

# scx-blog Constitution

## Core Principles

### Maintainable Migration
All migration activities must prioritize maintainability by preserving existing Markdown content and frontmatter. The migration from VitePress to Astro must not alter the fundamental content structure, ensuring future editing workflows remain unchanged.

### Lightweight Architecture
The system must maintain a lightweight deployment profile, leveraging Astro's zero-JS approach where possible and optimizing for fast loading times. All technical choices should support minimal bundle sizes and efficient static asset delivery.

### Markdown-First Workflow
The content authoring workflow must remain Markdown-centric, preserving the existing author experience. All new systems and components should accommodate the established Markdown workflow without requiring authors to learn new content formats.

### Progressive Enhancement
Migration to Astro must be implemented with progressive enhancement principles: core functionality (content delivery) must work without JavaScript, with enhanced features layered on top for improved UX where appropriate.

### Infrastructure Simplicity
Deployment and hosting infrastructure must remain simple and cost-effective. Prefer serverless solutions (Cloudflare Pages + R2) over complex server management, and maintain straightforward CI/CD processes.

## Development Workflow

All development follows a structured approach with distinct roles: Architect designs the overall migration strategy and technical specifications, Developer implements the migration and new features, and Reviewer validates functionality and performance. This ensures quality control and knowledge distribution throughout the project.

## Quality Assurance

Migration deliverables must include a fully functional Astro blog that matches the original VitePress functionality, comprehensive migration scripts to automate the conversion process, and detailed documentation to guide future maintenance and updates. Each component must be tested across multiple environments before acceptance.

## Governance

This constitution governs all technical and process decisions for the scx-blog migration project. All pull requests and code reviews must verify compliance with these principles. Any significant architectural changes require explicit documentation of how they align with or modify these principles.

**Version**: 1.0.0 | **Ratified**: 2025-10-24 | **Last Amended**: 2025-10-24
