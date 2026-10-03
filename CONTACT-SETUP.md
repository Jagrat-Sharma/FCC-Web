# Activate contact enquiries

Apply the database migration from this project directory:

`npx wrangler d1 migrations apply fcc-cms --remote`

Configure production Pages variables TURNSTILE_SITE_KEY, CONTACT_FROM_EMAIL (a sender on your Resend-verified domain), and CONTACT_TO_EMAIL (firstchoicecarpets@hotmail.com). Configure TURNSTILE_SECRET_KEY and RESEND_API_KEY as secrets, never in source control. Keep the existing DB binding and PUBLIC_ORIGIN; the latter must exactly match the public origin without a trailing slash. Create a Turnstile widget for that hostname and verify your sending domain with Resend.

Deploy the website and Functions after configuration. Keep /api/contact and /api/contact/config public, and protect /admin/* and /api/admin/* with existing authentication. Preview environments need separate data and configuration. Submit a real test enquiry after deployment, check the admin inbox and notification delivery, and verify Reply-To addresses the customer.

## Enquiries

Use Admin > Enquiries to read messages, reply by email or phone, and mark New, Contacted or Closed. Status changes do not send email. Failed notifications leave enquiries saved. After fixing email settings, use Retry email notification. Acceptance by Resend does not guarantee delivery; check bounces there. Its idempotency protection lasts 24 hours, so retrying an uncertain send later may duplicate a notification.

Restrict access to customer information and establish a retention period. Closing an enquiry does not delete it or subscribe the customer to marketing.

## Abuse limits

Three attempts per IP and browser cookie per clock hour. A Secure, HttpOnly, SameSite security cookie lasts one hour; clearing it does not remove the IP limit. Only hourly keyed hashes of these identifiers are stored in rate-limit records. Turnstile is verified on the server, including hostname and action. Same-origin checks, input validation and a honeypot provide additional protection.

A maximum of 30 saved enquiries across all visitors is allowed in a rolling hour. The next submission is blocked and visitors are directed to call 905-458-5555 or 416-245-4444. The limit is enforced atomically at insertion so simultaneous submissions cannot exceed it. The form becomes available as earlier enquiries leave the rolling window; refresh to retry. This pauses only contact submissions, not the website or admin. Confirmed retries of an already saved enquiry do not consume more slots.

Rejected requests still use server resources. These controls are not a billing cap or a substitute for edge protection.

## Checks

`node tools/build.mjs`

`node --test --test-isolation=none tests/cms.test.mjs`

`python build.py`
