# User Journeys

## 1. Citizen Onboarding
1. Landing page explains value; user selects "Sign Up".
2. Provide phone/email; receive OTP for verification.
3. Capture name, state, preferred language, and service interests.
4. Optional KYC-lite: upload ID proof to unlock advanced services.
5. Expert system pre-populates recommended services on dashboard.

## 2. Service Discovery
1. User searches for "Income Certificate".
2. Results show matching services with state filters and effort level.
3. Selecting a service opens overview (eligibility, documents, fees, timelines).
4. Expert system evaluates user profile to mark eligibility.
5. User bookmarks the service or starts application wizard.

## 3. Guided Application Wizard
1. Wizard prompts for key eligibility answers (income band, residency, documents).
2. Expert system evaluates responses, surfaces missing requirements, and explains why.
3. Wizard provides step checklist (online submission link, in-person steps if needed).
4. User uploads documents into vault, associating them with checklist items.
5. Submission summary generated with instructions and download links.

## 4. Document Vault Management
1. User uploads Aadhaar PDF; system auto-detects document type.
2. User tags document for multiple services; sets expiry reminders.
3. Vault displays compliance status (valid/expiring/expired).
4. Sharing toggle allows temporary access for support agents.

## 5. Status Tracking and Notifications
1. User returns to dashboard to see unified timeline.
2. Cron job pulls status updates (manual or API); notifications triggered for changes.
3. Late processing triggers alert with escalation contacts and steps.
4. User adds notes or uploads receipt for manual steps.

## 6. Support Escalation
1. Within a stalled application, user opens help panel.
2. Chatbot gathers context; escalates to live agent if needed.
3. Agent accesses contextual data (with consent) and suggests next actions.
4. Resolution recorded; expert rules flagged if update required.

## 7. Admin Rule Authoring
1. Admin logs into console; selects service rule set.
2. Edits eligibility conditions with form-based builder (effective dates, sources).
3. Runs regression tests; system blocks publish on failure.
4. Publish propagates version to Redis cache with audit log.
