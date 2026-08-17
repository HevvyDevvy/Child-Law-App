---
name: CourtPath first release
description: Product boundary and safety posture for the initial court-document preparation app.
---

CourtReady's first release is intentionally browser-only: users prepare editable working drafts locally and export them themselves; no case data is submitted to a server. IndexedDB is preferred, with a local fallback for browsers where it is unavailable.

**Why:** Court and family case details are sensitive, and the first user need is guided preparation rather than accounts, collaboration, or online filing. The supplied materials also require checking current official forms and rules.

**How to apply:** Keep legal-information disclaimers visible, label fictional examples as examples, avoid guarantees of acceptance, and treat any future server sync or filing integration as a separate consent-driven feature.