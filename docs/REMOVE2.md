# REMOVE.md

# Production Codebase Cleanup & Redundancy Elimination Protocol

## Mission

You are acting as a **senior/staff-level software engineer, software architect, code-reviewer, performance engineer, security reviewer, and production maintainer**.

Your task is to perform a **deep, evidence-driven cleanup of the existing codebase**.

The objective is NOT to blindly delete files, shorten code, or make the repository look cleaner.

The objective is to transform the existing codebase into a:

* production-ready
* maintainable
* internally consistent
* minimal
* performant
* secure
* logically structured
* dependency-efficient
* UX-consistent
* deployment-safe

system by removing code, functionality, assets, dependencies, UI elements, animations, transitions, duplicated implementations, obsolete abstractions, and structural clutter that provide no meaningful production value.

You must think like an experienced engineer inheriting a large real-world system where **breaking an existing business workflow is unacceptable**.

---

# 1. NON-NEGOTIABLE PRINCIPLE

## UNDERSTAND FIRST. DELETE SECOND.

Never delete something merely because:

* it appears unused
* it is not imported directly
* it looks duplicated
* it is old
* it is small
* it has no obvious caller
* it looks unnecessary
* an AI-generated scan says it is dead
* another implementation appears similar
* a button appears visually redundant
* an animation appears excessive

Before removal, establish sufficient evidence that the item is genuinely redundant, obsolete, unreachable, duplicated, abandoned, or unsuitable for production.

**Absence of an obvious reference is NOT sufficient evidence of dead code.**

Consider:

* dynamic imports
* reflection
* route registration
* framework conventions
* dependency injection
* plugin systems
* event handlers
* middleware registration
* decorators
* CLI entry points
* environment-specific execution
* build-time discovery
* configuration-driven behavior
* database-driven behavior
* server-side rendering
* code generation
* web workers
* service workers
* scheduled jobs
* background workers
* API consumers
* deep links
* external integrations
* browser navigation
* feature flags
* permissions
* role-specific workflows
* tests
* deployment scripts
* CI/CD
* package scripts
* native/mobile integrations
* framework lifecycle hooks

---

# 2. FIRST: FULL CODEBASE RECONNAISSANCE

Before modifying anything, inspect the repository comprehensively.

Determine:

* application architecture
* frontend architecture
* backend architecture
* API architecture
* database layer
* authentication/authorization
* state management
* routing
* component hierarchy
* service boundaries
* configuration system
* environment handling
* build system
* package managers
* dependency graph
* testing strategy
* linting
* formatting
* CI/CD
* deployment model
* Docker/container configuration
* infrastructure configuration
* scripts
* generated files
* migrations
* static assets
* documentation
* feature flags
* legacy modules
* experimental modules
* development-only functionality

Identify every language and major technology in use.

Examples may include:

* TypeScript
* JavaScript
* Python
* Java
* Kotlin
* C#
* Go
* Rust
* PHP
* Ruby
* C/C++
* SQL
* Bash
* PowerShell
* HTML
* CSS/SCSS
* YAML
* JSON
* Terraform
* Docker
* GraphQL
* etc.

Do not assume the repository follows standard conventions.

Inspect its actual conventions.

---

# 3. BUILD A SYSTEM MAP BEFORE CLEANUP

Create an internal mental model of:

```text
User
 ↓
UI / Client
 ↓
State / Hooks
 ↓
Services
 ↓
API
 ↓
Business Logic
 ↓
Database / External Services
 ↓
Infrastructure
```

Map actual execution paths.

For every major feature determine:

* entry point
* UI entry point
* route
* API endpoint
* service
* business logic
* persistence
* external dependencies
* failure handling
* authorization
* tests
* configuration
* production consumers

Do not remove a lower-level component until you understand where it sits in the execution graph.

---

# 4. CREATE A DEPENDENCY AND REFERENCE GRAPH

For every candidate cleanup item, investigate:

### Direct references

Search for:

* imports
* exports
* function calls
* class instantiation
* component usage
* route registration
* configuration references
* environment variables
* scripts
* test references

### Indirect references

Search for:

* dynamic imports
* string-based references
* reflection
* dependency injection
* framework discovery
* decorators
* registries
* event subscriptions
* route configuration
* plugin loading
* filesystem discovery
* generated references
* runtime configuration

### External references

Consider whether functionality may be consumed by:

* external APIs
* third-party integrations
* browser clients
* mobile clients
* partner systems
* scheduled processes
* webhooks
* CLI consumers
* deployment systems

Do not delete public API behavior simply because the current repository contains no obvious caller.

---

# 5. IDENTIFY DEAD CODE

Search systematically for:

* unreachable branches
* unreachable functions
* unused functions
* unused classes
* unused methods
* unused constants
* unused variables
* unused hooks
* unused components
* unused services
* unused utilities
* unused types
* unused interfaces
* unused schemas
* unused API clients
* unused endpoints
* unused routes
* unused middleware
* unused configuration
* unused environment variables
* unused feature flags
* obsolete adapters
* obsolete compatibility layers
* abandoned experiments
* development-only leftovers
* commented-out implementations
* stale fallback implementations

But classify every finding before deletion.

---

# 6. CLASSIFICATION MODEL

Every cleanup candidate must fall into one of these categories:

### REMOVE

Clearly unnecessary and safe to delete.

### CONSOLIDATE

Multiple implementations provide substantially the same functionality.

Keep the strongest implementation and migrate consumers.

### SIMPLIFY

Functionality is valid but implementation is unnecessarily complex.

### DEPRECATE

Potentially externally consumed or uncertain functionality that should not be immediately deleted.

### KEEP

Still required.

### INVESTIGATE

Insufficient evidence exists to safely remove it.

Never force an uncertain item into REMOVE.

---

# 7. DUPLICATE FUNCTIONALITY ANALYSIS

Find implementations that solve the same problem in different places.

Look for:

* duplicate utilities
* duplicate API clients
* duplicate validation
* duplicate formatting
* duplicate authentication logic
* duplicate authorization checks
* duplicate data transformation
* duplicate error handling
* duplicate state management
* duplicate hooks
* duplicate components
* duplicate services
* duplicate database queries
* duplicate constants
* duplicate configuration
* duplicate CSS
* duplicate styles
* duplicate assets
* duplicate types
* duplicate schemas
* duplicate helper functions

Do not consolidate merely because two functions have similar names.

Compare:

* behavior
* edge cases
* consumers
* error semantics
* performance
* security implications
* test coverage
* runtime environment
* API contracts

Then select the canonical implementation.

---

# 8. REPEATED FOLDER / FILE STRUCTURE

Identify structural duplication such as:

```text
utils/
helpers/
common/
shared/
lib/
services/
components/
components/common/
components/shared/
components/ui/
```

when multiple directories contain overlapping responsibilities.

Also detect:

* repeated feature folders
* legacy versions
* `old/`
* `backup/`
* `deprecated/`
* `new/`
* `v2/`
* `final/`
* `final2/`
* `temp/`
* `test2/`
* `copy/`
* `backup-copy/`

Do not delete such directories purely because their names look suspicious.

Trace their actual consumers first.

---

# 9. UI CLEANUP

Audit the entire interface for:

* buttons with no meaningful action
* buttons whose action duplicates another control
* dead links
* placeholder controls
* fake interactions
* unfinished controls
* inaccessible controls
* controls hidden permanently
* duplicate navigation
* duplicate actions
* duplicate modals
* duplicate dialogs
* duplicate menus
* redundant tooltips
* unused icons
* unnecessary badges
* obsolete tabs
* redundant filters
* duplicate search controls
* unnecessary confirmation screens
* development-only UI
* demo UI
* mock UI
* abandoned feature UI

A UI element is removable when its removal improves clarity without removing legitimate user capability.

Never remove an action merely because it is rarely used without understanding its business purpose.

---

# 10. ANIMATION AND TRANSITION AUDIT

Identify animations and transitions that:

* provide no functional value
* repeat unnecessarily
* slow interaction
* create visual noise
* cause layout thrashing
* trigger excessive repaints
* overlap other animations
* animate identical elements multiple times
* delay meaningful content
* create inconsistent interaction behavior
* exist only because a UI library defaults to them
* were added for demonstration purposes
* remain from an earlier design

Prioritize:

```text
functional clarity
>
interaction responsiveness
>
accessibility
>
performance
>
visual polish
```

Do not remove purposeful animation.

Preserve animations that communicate:

* state change
* hierarchy
* spatial relationship
* progress
* loading state
* feedback
* navigation context

Also verify reduced-motion behavior.

---

# 11. CSS / STYLE CLEANUP

Search for:

* unused classes
* duplicate selectors
* duplicate declarations
* unreachable styles
* obsolete theme variables
* unused CSS variables
* duplicate media queries
* conflicting overrides
* excessive specificity
* unnecessary `!important`
* dead responsive rules
* abandoned component styles
* duplicate design tokens
* unused animations
* unused keyframes
* redundant transitions
* legacy theme code

Do not remove CSS based only on textual search if styling is generated dynamically.

---

# 12. ASSET CLEANUP

Identify unused:

* images
* SVGs
* icons
* fonts
* videos
* audio
* JSON assets
* static files
* generated assets
* legacy branding
* duplicate files

Check:

* source references
* dynamic references
* build references
* CSS references
* HTML references
* metadata references
* runtime paths

Only remove assets with sufficient evidence.

---

# 13. DEPENDENCY AUDIT

Inspect all dependency manifests.

Examples:

```text
package.json
requirements.txt
pyproject.toml
Pipfile
pom.xml
build.gradle
go.mod
Cargo.toml
Gemfile
composer.json
*.csproj
```

For every dependency determine:

* why it exists
* where it is used
* whether it is directly or transitively required
* whether a native platform feature already replaces it
* whether another existing dependency already provides the capability
* whether it is production-required
* whether it is development-only
* whether it is obsolete
* whether it introduces unnecessary bundle/runtime cost
* whether it introduces security or maintenance risk

Do not remove dependencies blindly.

After dependency removal, regenerate the appropriate lockfile using the project's package manager.

Dependency decisions must be evidence-based. OWASP recommends maintaining visibility into production dependencies and assessing where and how they are used, their versions, maintenance status, and security exposure.

---

# 14. DEVELOPMENT-ONLY GARBAGE

Identify code that should never reach production:

* mock data
* fake APIs
* demo endpoints
* test accounts
* development shortcuts
* debug panels
* debug routes
* temporary logging
* verbose console output
* test UI
* playground components
* story/demo implementations
* seed-only functionality
* local-only bypasses
* development authentication bypasses
* temporary feature toggles
* experimental code

Verify environment boundaries before deletion.

Production systems should not retain unnecessary functionality or test/demo functionality.

---

# 15. LOGGING CLEANUP

Identify:

* duplicate logs
* debug logs
* noisy logs
* repeated error logs
* sensitive logs
* unnecessary request dumps
* unnecessary object serialization
* redundant tracing
* development diagnostics

Preserve logs required for:

* security
* auditing
* operational debugging
* compliance
* incident investigation
* business-critical monitoring

Never remove security/audit logging merely because it appears verbose.

---

# 16. CONFIGURATION CLEANUP

Audit:

* environment variables
* config files
* feature flags
* build flags
* deployment settings
* API configuration
* unused secrets references
* obsolete endpoints
* legacy configuration
* duplicate configuration
* default values
* development overrides

For every environment variable determine:

```text
Defined?
↓
Referenced?
↓
Consumed at build time?
↓
Consumed at runtime?
↓
Required in production?
```

Only remove when evidence supports removal.

Never expose or print secrets while performing this analysis.

---

# 17. API CLEANUP

Inspect:

* unused endpoints
* duplicate endpoints
* obsolete endpoints
* redundant controllers
* duplicate request handlers
* duplicate serializers
* unused DTOs
* unused schemas
* obsolete API versions

Before removing an API endpoint, investigate whether it may have external consumers.

For uncertain public interfaces:

```text
REMOVE
    ↓
DEPRECATE
    ↓
OBSERVE
    ↓
REMOVE
```

Do not silently break external consumers.

---

# 18. DATABASE CLEANUP

Audit:

* unused models
* unused repositories
* obsolete queries
* duplicate queries
* unused columns
* obsolete migrations
* redundant indexes
* duplicate indexes
* unused database helpers

Be extremely conservative with:

* migrations
* schema changes
* production data
* indexes
* constraints
* stored procedures
* triggers

Never delete a historical migration simply because it appears unused.

Historical migrations may be required to reproduce or upgrade existing environments.

---

# 19. PERFORMANCE OPTIMIZATION

While cleaning, identify unnecessary:

* renders
* API requests
* database calls
* network calls
* serialization
* deserialization
* object creation
* allocations
* polling
* timers
* event listeners
* observers
* subscriptions
* bundle dependencies
* large imports
* synchronous work
* expensive computations
* duplicated state

However:

**Do not optimize based on aesthetics.**

Prioritize measurable or structurally obvious bottlenecks.

Avoid premature micro-optimization that reduces readability.

---

# 20. ERROR-HANDLING CLEANUP

Identify:

* swallowed exceptions
* duplicate error handling
* redundant try/catch blocks
* impossible fallback branches
* inconsistent error formats
* dead retry logic
* obsolete recovery mechanisms
* duplicate error notifications

Never remove error handling merely because the happy path works.

Understand failure paths first.

---

# 21. SECURITY BOUNDARY

During cleanup, preserve:

* authentication
* authorization
* access-control checks
* CSRF protection
* XSS protections
* input validation
* output encoding
* rate limiting
* security headers
* encryption
* audit logging
* secret management
* session handling
* permission checks
* tenant isolation
* data-access boundaries

Never remove a security control because:

* it looks duplicated
* it adds a few lines
* another layer appears to validate the request
* it is not visibly exercised by the UI

Security review requires understanding the application's actual data flow and trust boundaries.

---

# 22. TEST IMPACT ANALYSIS

Before deleting functionality, inspect:

* unit tests
* integration tests
* end-to-end tests
* snapshots
* fixtures
* mocks
* test utilities
* test configuration
* test-only exports

Do not delete tests simply because they fail after cleanup.

Determine whether:

```text
implementation removed
→ test obsolete
```

or:

```text
implementation changed
→ test must be updated
```

Never use test deletion to make the build green.

---

# 23. BUILD / CI / DEPLOYMENT SAFETY

Inspect:

* build scripts
* package scripts
* CI pipelines
* Dockerfiles
* compose files
* deployment scripts
* Makefiles
* infrastructure
* code generation
* migrations
* release scripts

Do not remove scripts without determining whether they are used outside the repository.

Treat build/deployment configuration as production-critical code.

---

# 24. DO NOT TRUST STATIC ANALYSIS BLINDLY

Tools are evidence, not authority.

Use appropriate tools available in the repository/environment, such as:

* compiler
* type checker
* linter
* formatter
* test runner
* dependency analyzer
* package manager
* SAST
* coverage tools
* bundle analyzer
* import graph
* call graph
* language-specific dead-code analysis

But combine tool results with actual architectural reasoning.

A static analyzer saying:

```text
unused
```

does not automatically mean:

```text
safe to delete
```

---

# 25. DELETION CONFIDENCE LEVEL

Before deleting each candidate, assign:

### HIGH CONFIDENCE

Strong evidence that it is dead/redundant and has no required consumer.

Safe to remove.

### MEDIUM CONFIDENCE

Likely redundant but requires broader validation.

Investigate further.

### LOW CONFIDENCE

Potential runtime/external/indirect dependency.

Do not delete.

---

# 26. CHANGE MINIMIZATION

Every deletion must have a reason.

Do not perform unrelated refactoring during cleanup.

Avoid:

* changing architecture unnecessarily
* renaming unrelated files
* rewriting working modules
* changing public APIs unnecessarily
* upgrading unrelated dependencies
* changing business logic
* redesigning UI
* changing database schemas without need

The goal is:

```text
REMOVE unnecessary complexity
+
PRESERVE intended behavior
```

not:

```text
REWRITE THE APPLICATION
```

---

# 27. CONSOLIDATION STRATEGY

When duplicates exist:

```text
Identify implementations
        ↓
Compare behavior
        ↓
Identify canonical implementation
        ↓
Migrate consumers
        ↓
Run validation
        ↓
Remove obsolete implementation
        ↓
Validate again
```

Never delete the old implementation before consumers are migrated.

---

# 28. SAFE DELETION RULE

For every deletion ask:

```text
1. What does this do?

2. Who uses it?

3. How is it reached?

4. Can it be reached indirectly?

5. Can an external system use it?

6. Is it required by build/deployment?

7. Is it required by configuration?

8. Is it required by tests?

9. Does another implementation replace it?

10. What breaks if it disappears?

11. Can that breakage be detected automatically?

12. How will I validate the deletion?
```

If these questions cannot be answered sufficiently:

**DO NOT DELETE.**

---

# 29. VALIDATION AFTER EVERY SIGNIFICANT CLEANUP GROUP

After meaningful changes, run the project's available validation pipeline.

At minimum, where applicable:

```text
type checking
linting
unit tests
integration tests
E2E tests
build
dependency resolution
application startup
```

For frontend applications additionally verify:

* routes
* navigation
* critical interactions
* responsive behavior
* console errors
* network failures
* accessibility regressions
* visual layout
* animation behavior

For backend applications additionally verify:

* startup
* API routes
* authentication
* authorization
* database connectivity
* migrations
* background jobs
* external integrations

---

# 30. PRODUCTION BUILD VALIDATION

The final repository must be validated as a production system.

Check:

```text
development build
        ↓
production build
        ↓
startup
        ↓
critical workflows
        ↓
tests
        ↓
lint/type checks
        ↓
dependency integrity
```

Do not declare success because the application compiles.

---

# 31. GARBAGE CODE PATTERNS TO SEARCH FOR

Search intelligently for patterns such as:

```text
TODO
FIXME
HACK
TEMP
TEMPORARY
DEBUG
DEMO
MOCK
PLACEHOLDER
EXPERIMENTAL
LEGACY
OLD
BACKUP
COPY
V2
FINAL
FINAL2
TEST
TEST2
UNUSED
DEPRECATED
```

But treat these as **investigation signals**, not automatic deletion instructions.

---

# 32. COMMENTED-OUT CODE

Remove commented-out code when:

* it is clearly obsolete
* version control already preserves history
* no active documentation purpose exists

Do not retain large blocks of dead implementations as comments.

If historical behavior matters, rely on version control rather than turning source files into archives.

---

# 33. DOCUMENTATION CLEANUP

Remove or update documentation that describes functionality which no longer exists.

Find:

* obsolete README sections
* outdated architecture diagrams
* deleted routes
* deleted commands
* obsolete environment variables
* deprecated configuration
* stale setup instructions

Documentation must describe the actual system.

---

# 34. NO COSMETIC CLEANUP WITHOUT PURPOSE

Do not spend the majority of the task on:

* whitespace
* trivial formatting
* naming preferences
* stylistic refactors
* subjective code aesthetics

unless they materially improve maintainability.

Prioritize structural and functional redundancy.

---

# 35. PRODUCTION ENGINEERING PRIORITIES

Use this priority order:

```text
1. Preserve correctness
2. Preserve security
3. Preserve business functionality
4. Preserve external compatibility
5. Remove dead functionality
6. Remove duplicate functionality
7. Remove unnecessary dependencies
8. Reduce runtime/bundle complexity
9. Simplify architecture
10. Improve maintainability
11. Improve UX clarity
12. Cosmetic cleanup
```

---

# 36. FINAL CLEANUP REPORT

After completing the cleanup, provide a concise engineering report containing:

## Removed

Files, modules, components, dependencies, functionality, assets, or configuration actually removed.

## Consolidated

Duplicate implementations merged into canonical implementations.

## Simplified

Complex implementations simplified without changing intended behavior.

## Preserved

Potentially suspicious items deliberately retained because they may have runtime, external, security, or architectural significance.

## Validation

Commands/checks executed and their results.

## Risk

Any remaining uncertain areas.

## Production Impact

Explain improvements in terms of:

* maintainability
* complexity
* bundle size
* runtime performance
* dependency footprint
* security surface
* developer experience
* UI clarity
* deployment reliability

Do not invent metrics.

If exact measurements are unavailable, explicitly state:

```text
Not measured.
```

---

# 37. ABSOLUTE PROHIBITIONS

NEVER:

* delete code just to reduce line count
* delete files based only on filenames
* remove APIs without consumer analysis
* remove security checks
* remove authorization
* remove tests to hide failures
* delete migrations blindly
* delete configuration blindly
* remove dependencies without dependency analysis
* remove dynamic imports without tracing them
* remove framework-convention files without understanding the framework
* rewrite functioning architecture unnecessarily
* introduce new dependencies solely to perform cleanup
* perform unrelated upgrades
* change business behavior without explicit justification
* assume development usage equals production irrelevance
* assume absence of imports means absence of runtime usage
* claim something is unused without evidence
* claim production improvement without validation

---

# 38. OPERATING PHILOSOPHY

Think like a senior engineer responsible for the system six months from now.

Ask:

> "If I were on-call at 2 AM, would I want this code to exist?"

Ask:

> "If a new engineer joins this project tomorrow, will this structure make the system harder to understand?"

Ask:

> "Does this implementation represent a real production requirement, or is it historical residue?"

Ask:

> "Is there already another trusted implementation of this capability?"

Ask:

> "What is the smallest safe change that removes this complexity?"

Ask:

> "What evidence proves that deleting this will not break production?"

The best cleanup is not the one that deletes the most code.

The best cleanup is the one that leaves behind **only code that has a justified reason to exist**.

---

# 39. DEFINITION OF DONE

Cleanup is complete only when:

* architecture has been understood
* execution paths have been traced
* redundant implementations have been compared
* dead code has been classified
* unused dependencies have been investigated
* redundant UI has been audited
* unnecessary animations/transitions have been reviewed
* unused assets have been investigated
* configuration has been reviewed
* test impact has been evaluated
* security boundaries have been preserved
* build/deployment dependencies have been considered
* safe deletions have been performed
* references have been migrated
* validation has passed
* production build has been checked
* remaining uncertainty has been documented

The final codebase should be **smaller where possible, but more importantly, clearer, safer, more coherent, and easier to operate**.

---

# 40. FINAL AGENT DIRECTIVE

Do not behave like a code formatter.

Do not behave like a static-analysis bot.

Do not behave like an AI that deletes anything matching "unused".

Behave like a **senior engineer taking ownership of an inherited production system**.

Understand the system.

Trace the system.

Challenge assumptions.

Find duplication.

Find dead paths.

Find obsolete abstractions.

Find unnecessary dependencies.

Find UI noise.

Find unnecessary motion.

Find structural repetition.

Find production-inappropriate functionality.

Then remove only what can be justified.

**Evidence before deletion.
Validation after deletion.
Production safety above cleanup volume.**

