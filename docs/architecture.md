# Architecture Overview

## System Context
- **Channels**: Responsive web app for citizens, admin console for staff.
- **External Systems**: Government portals (APIs/web), SMS/email gateways, identity verification providers, analytics platforms.

## Logical Components
1. **Frontend SPA**
   - Authentication shell, dashboards, catalog, wizard, document vault, notifications, admin console.
2. **API Gateway (NestJS)**
   - Serves REST/GraphQL endpoints, orchestrates requests, enforces authz, rate limiting.
3. **Domain Services**
   - User/Profile Service, Service Catalog Service, Expert Guidance Service, Workflow Service, Notification Service, Support Service, Admin CMS.
4. **Expert System Engine**
   - Rule loader, inference engine, explanation builder, test harness.
5. **Data Stores**
   - PostgreSQL (primary OLTP), Redis (cache/session/rule snapshots), Blob Storage (documents), Optional Data Lake (analytics).
6. **Async Infrastructure**
   - Azure Service Bus queues/topics for notifications, status syncs, rule deployments.
7. **Observability**
   - OpenTelemetry collectors, centralized logging, metric dashboards, alerting.

## Data Flow Summary
1. Citizen logs in; frontend obtains OAuth2 tokens, calls API Gateway.
2. Catalog requests served by Service Catalog Service reading from PostgreSQL + Redis cache.
3. Wizard invokes Expert Guidance Service, which evaluates rules and returns explanations.
4. Document uploads stored in Blob Storage with metadata entries in PostgreSQL.
5. Status updates triggered by scheduled workers; results pushed via notifications and stored in timeline tables.
6. Admin publishes rule updates; version stored in PostgreSQL, distributed via queue to refresh caches.

## Security Considerations
- OAuth2/OpenID with PKCE for citizens; RBAC for staff.
- Encrypt sensitive fields at rest (KMS-managed keys).
- Audit trail for admin changes and rule publications.
- Document-sharing consent flows and expiry controls.

## Deployment Topology
- Azure Kubernetes Service hosting frontend (via SSG) and backend services.
- Managed PostgreSQL (Azure Database for PostgreSQL Flexible Server).
- Azure Cache for Redis, Azure Blob Storage, Azure Service Bus.
- Terraform-managed infrastructure with separate dev/staging/prod environments.
