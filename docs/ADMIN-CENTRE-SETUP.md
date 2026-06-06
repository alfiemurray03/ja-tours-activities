# JA Travel & Experiences Admin Centre Setup

The admin centre is designed for Cloudflare Pages and must not be treated as secure until every item below is complete.

## 1. Protect the admin routes

Create a Cloudflare Access self-hosted application covering:

- `/admin/*`
- `/api/admin/*`

Allow only specifically authorised JA Group Services Ltd email addresses. One-time PIN authentication may be used initially.

Set the following server variables on the Pages project:

- `TEAM_DOMAIN`: the full Cloudflare Access team URL, such as `https://example.cloudflareaccess.com`
- `POLICY_AUD`: the Access application Audience tag

The server validates the `Cf-Access-Jwt-Assertion` signature, issuer, audience and expiry on every admin API request.

## 2. Create and bind D1

Create a D1 database for website content and bind it to the Pages project with the variable name:

`CONTENT_DB`

Apply:

`migrations/0001_admin_content.sql`

The database stores:

- service names, descriptions and proposed prices;
- draft and published policies;
- admin audit entries;
- verified Stripe webhook event IDs and payloads.

It must never store payment-card details or Stripe secret keys.

## 3. Add Stripe secrets

In Cloudflare Pages, open **Settings → Variables and Secrets** and add encrypted secrets:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

Never put these values in:

- GitHub;
- `wrangler.jsonc`;
- browser JavaScript;
- an admin form;
- email or support messages.

The admin centre reports whether each secret exists but cannot display its value.

## 4. Register the Stripe webhook

Create a Stripe webhook destination using:

`https://YOUR-LIVE-DOMAIN/api/stripe/webhook`

Begin in Stripe test mode. The endpoint:

- reads the original raw request body;
- verifies the `Stripe-Signature` HMAC;
- rejects events more than five minutes old;
- records event IDs once using a unique database constraint.

Only subscribe to events required by the approved payment workflow. Checkout creation and automatic fulfilment are deliberately not enabled until products, pricing, VAT, cancellation rights and order handling are approved.

## 5. Publish policies

Use `/admin/` to create a policy as a draft. After internal or legal approval, change its status to **Published**.

Published policies are available at:

`/policies/?slug=POLICY-SLUG`

Recommended slugs:

- `terms-of-service`
- `privacy-policy`
- `cookie-policy`
- `important-information`
- `affiliate-disclosure`
- `accessibility-statement`
- `complaints-and-refunds`

## 6. Release checks

Before production use:

1. Confirm Cloudflare Access blocks an unauthorised browser.
2. Confirm an approved administrator can load `/admin/`.
3. Confirm D1 migrations have completed.
4. Create and publish a test policy.
5. Change a service price and verify `/pricing/`.
6. Send a Stripe test webhook and confirm a `200` response.
7. Send an invalid webhook signature and confirm a `400` response.
8. Confirm no secret values appear in source code, logs or browser responses.
