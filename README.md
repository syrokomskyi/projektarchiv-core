# Projektarchiv Core

Provider-neutral domain contracts for Projektarchiv. Runtime compositions and
provider adapters belong outside this package and depend on it inward.

PA-000 establishes the package boundary. PA-010 owns UUIDv7 identities, strict
versioned schemas, pure state/authority policies, and provider-neutral source,
artifact, catalog, and coordination ports.

Public entrypoints are the package root plus `/schemas`, `/policies`, `/ports`,
and `/schemas-json/*`. Concrete adapters and workflow orchestration live outside
the core.
