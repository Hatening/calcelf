# CalcElf · Production MVP

## Goal
A global K–12 AI Visual Tutor: photo / manual input / voice add-on → problem recognition → step-by-step teaching → 1–3 meaningful solution methods → optional animation → current-problem context Q&A → similar-problem practice → stars / levels / themes → Credits billing.

## Included in This Version
- Top global language switcher: Chinese / English / Français / Deutsch / Español / Italiano / العربية; Arabic RTL.
- Learning-stage themes: Primary 1–3, Primary 3–6, Middle School 1–2, Grade 9–High School; font / corner radius / information density / visual atmosphere change automatically.
- Membership growth themes: lifetime level controls the primary color, monthly level controls accents; functional layout is not changed.
- Photo + manual correction.
- Browser Speech-to-Text voice add-on; raw voice is not sent directly to the problem-solving model.
- Current-problem context chat; only the summary / current solution is sent, not the full history.
- Optional animation, sandboxed iframe.
- Credits as service units; backend database atomic deduction; frontend cannot modify the balance.
- Cloudflare Turnstile, disposable email domain blocking, IP / install-ID rate limiting, daily free problem quota, hourly / minute API rate limits.
- Practice Level 1/2/3, answer rewards, star-to-Credit redemption (monthly cap).
- Lifetime + Monthly dual levels, theme switching API, badges, invite codes, goodwill reset.
- Stripe Checkout + Billing Portal + webhook skeleton.
- Supabase schema + RLS + server-only service key.

## Must Be Completed Before Production
1. Replace the environment variables required by `public-config`.
2. Run `supabase/schema.sql` in Supabase.
3. Configure all Vercel environment variables.
4. Create a Cloudflare Turnstile site and configure site/secret keys.
5. Create Stripe products/prices and configure webhook.
6. First run complete payment / refund / renewal tests in Stripe Test mode.
7. Have local legal / privacy counsel review Privacy / Terms, child accounts / parental consent, cross-border data transfer, tax, and payment terms.
8. Disable all demo / debug entries in production.

## Do Not Store in the Browser
- OpenAI API key
- Supabase service-role key
- Stripe secret key

## Primary Domain
- `https://www.calcelf.com` as canonical.
- `https://calcelf.com` may redirect to www; `www.calcelf.net` / `calcelf.net` should uniformly 301 redirect to .com.
