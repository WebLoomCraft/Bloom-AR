import type { LegalDocument } from './types.ts';
import { LEGAL_ENTITY, entityFullName } from './entity.ts';

const E = LEGAL_ENTITY;

export function cookiesDocument(): LegalDocument {
  return {
    slug: 'cookies',
    title: 'Cookie Policy',
    shortTitle: 'Cookies',
    summary:
      'Every cookie and browser storage item BloomAR Manager uses, what it does, how long it lasts, and how to control it.',
    effectiveDate: '[[EFFECTIVE_DATE]]',
    lastUpdated: '[[LAST_UPDATED_DATE]]',
    version: '1.0',
    appliesTo: 'Everyone who visits the public website or signs in to the application.',
    related: ['privacy', 'terms'],
    blocks: [
      {
        type: 'p',
        text: `This policy explains how ${entityFullName(
          E
        )} uses cookies and similar technologies on the BloomAR Manager website and application. It should be read with our Privacy Policy, which explains the wider picture of what we collect and why.`,
      },
      {
        type: 'h2',
        text: 'What cookies are',
      },
      {
        type: 'p',
        text: 'A cookie is a small text file that a website stores in your browser. Cookies can keep you signed in, remember preferences, or help a site measure usage. We also describe two related technologies in this policy: browser local storage, which stores data in your browser and is not sent to our servers automatically, and server-side session records, which are how we validate the session cookie.',
      },
      {
        type: 'h2',
        text: 'Our approach: essential cookies only, no advertising',
      },
      {
        type: 'p',
        text: 'BloomAR Manager uses one cookie: the session cookie that keeps you signed in. We do not use advertising cookies, remarketing pixels, data-broker tags, cross-site tracking cookies, or session-replay tools. We do not place cookies on public marketing pages at all. We do not load any cookie that contains PHI, and we never pass patient, claim, or clinical information to a tracking system.',
      },
      {
        type: 'callout',
        tone: 'info',
        title: 'Why there is no cookie consent banner',
        text:
          'Because the only cookie we set is strictly necessary to provide a service you have explicitly requested by signing in, no consent is required for it under U.S. state privacy laws or the cookie rules that apply to our customers\u2019 jurisdictions. Installing a consent banner that collects consent for cookies that do not exist would be misleading. If we introduce analytics, advertising, or personalization cookies, we will add a consent mechanism (with prior opt-in where required) before those cookies are set, and we will update this policy first.',
      },
      { type: 'h2', text: 'Cookies we set' },
      {
        type: 'table',
        caption: 'First-party cookies',
        headers: ['Name', 'Category', 'Purpose', 'Duration'],
        rows: [
          [
            '`session`',
            'Strictly necessary',
            'Authenticates your session after you sign in. It holds an opaque session token, not your password or any patient data. Server-side, the token is matched to a session record that stores the user, the active organization, and expiry.',
            '7 days from sign-in (absolute), or until you sign out',
          ],
        ],
      },
      {
        type: 'p',
        text: 'The `session` cookie is set with `HttpOnly` (JavaScript cannot read it, which protects it from cross-site scripting), `Secure` (it is only sent over HTTPS), `Path=/`, and `SameSite=None` (so that the application works correctly when embedded in a permitted cross-origin frame, such as a hosted preview environment). Because `SameSite=None` means the cookie can be sent in cross-site requests, we compensate with server-side origin and authorization checks, a server-side idle timeout of 8 hours, an absolute lifetime of 7 days, and the ability to revoke any session from Account Settings.',
      },
      { type: 'h2', text: 'Cookies we do not set' },
      {
        type: 'ul',
        items: [
          'No analytics cookies. We do not run Google Analytics, Adobe Analytics, Plausible, PostHog, Mixpanel, or any equivalent on the website or in the product.',
          'No advertising or remarketing cookies, including Meta Pixel, Google Ads tags, LinkedIn Insight, TikTok, or affiliate-tracking pixels.',
          'No social-media embeds or share buttons that would set third-party cookies.',
          'No chat-widget or support-widget cookies from a third party.',
          'No cross-site tracking cookies and no fingerprinting scripts.',
        ],
      },
      { type: 'h2', text: 'Browser storage we use' },
      {
        type: 'p',
        text: 'Local storage is data your browser keeps for a site until it is cleared. It is not sent to us on every request. We use it only to remember display preferences on your own device:',
      },
      {
        type: 'table',
        caption: 'Local storage keys',
        headers: ['Key', 'Category', 'Purpose', 'Duration'],
        rows: [
          [
            '`bloomar-a11y`',
            'Functional',
            'Remembers your accessibility choices from the Accessibility toolbar (larger text, high contrast, reduced motion). Contains only three true/false values. Never contains account, patient, or claim data.',
            'Until you clear browser data',
          ],
          [
            '`ar_session_security`',
            'Functional / security',
            'Stores your own inactivity auto-logoff preference for this browser so the signed-in application can enforce it. Contains a timeout value and related switches only.',
            'Until you clear browser data',
          ],
        ],
      },
      {
        type: 'p',
        text: 'Both entries are optional in the sense that the application works without them; they only change display and convenience settings. Clearing them resets your preferences. Neither is used to identify you across sites or to build a profile.',
      },
      { type: 'h2', text: 'Third-party requests and services' },
      {
        type: 'p',
        text: 'Two third parties receive technical connection data when you load our pages. Neither receives Customer Data, patient data, or information about what you do inside a workspace.',
      },
      {
        type: 'dl',
        items: [
          {
            term: 'Vercel Speed Insights (performance measurement)',
            def: 'We use Vercel\u2019s performance monitoring to measure page load timing so we can fix slow pages. It is cookieless: it does not set cookies, does not store identifiers in your browser, and reports aggregated timing metrics such as route, load time, and connection quality. It runs on the public site and application shell, not on your claim or patient records.',
          },
          {
            term: 'Google Fonts (typeface delivery)',
            def: 'Our pages load the Inter typeface from Google\u2019s font service. When your browser requests the font file, Google receives your IP address, the referring page, and your browser user-agent as part of serving it. Google does not set a cookie through this request, but the request is a third-party transfer of your IP address. If you prefer to avoid it, you can block fonts.googleapis.com in your browser; the site will fall back to a system typeface and remain fully usable.',
          },
          {
            term: 'Stripe (payments)',
            def: 'When you open the checkout page you are taken to Stripe, and when you view a receipt or invoice you may be taken to a Stripe-hosted page. Stripe sets its own cookies there for fraud prevention and to operate checkout. Those cookies are governed by Stripe\u2019s own cookie and privacy policies, and they are set on Stripe\u2019s pages, not ours.',
          },
        ],
      },
      {
        type: 'p',
        text: 'Our hosting provider processes standard server logs (IP address, request path, user-agent, timestamp) as part of serving any website. This is infrastructure logging, not tracking, and is described in the Privacy Policy.',
      },
      { type: 'h2', text: 'How to control cookies' },
      {
        type: 'h3',
        text: 'In your browser',
      },
      {
        type: 'p',
        text: 'All major browsers let you view, block, and delete cookies and local storage. Blocking the `session` cookie will prevent you from signing in, because the application cannot authenticate you without it — this is true of any secure web application, not a choice we can work around. Blocking third-party requests to fonts.googleapis.com or the hosting platform\u2019s domains will degrade styling or performance but will not expose your data.',
      },
      {
        type: 'ul',
        items: [
          '**Chrome:** Settings \u2192 Privacy and security \u2192 Third-party cookies, and Settings \u2192 Privacy and security \u2192 Site settings \u2192 View permissions and data stored across sites.',
          '**Safari (macOS):** Safari \u2192 Settings \u2192 Privacy. **Safari (iOS):** Settings \u2192 Safari \u2192 Advanced \u2192 Website Data.',
          '**Firefox:** Settings \u2192 Privacy & Security \u2192 Cookies and Site Data.',
          '**Edge:** Settings \u2192 Cookies and site permissions \u2192 Manage and delete cookies and site data.',
        ],
      },
      { type: 'h3', text: 'In the application' },
      {
        type: 'ul',
        items: [
          'Sign out at any time from the account menu; this clears the session cookie on your device and revokes the session server-side.',
          'Use **Account Settings \u2192 Security & Sessions** to review active sessions and sign out individual devices or all other devices.',
          'Clear the two local-storage keys by clearing site data in your browser, which resets the accessibility and session-security preferences.',
        ],
      },
      { type: 'h3', text: 'Do Not Track and Global Privacy Control' },
      {
        type: 'p',
        text: 'Because we do not track users across sites and do not sell or share personal information for advertising, there is no cross-site tracking to disable. We honor Global Privacy Control signals to the extent they express an opt-out of sale or sharing; since we do not engage in either, your experience does not change. If we ever add a non-essential cookie or tracking technology, we will honor these signals for it.',
      },
      { type: 'h2', text: 'Consent requirements and customer obligations' },
      {
        type: 'p',
        text: 'For our own website, no non-essential cookies are used, so there is nothing to consent to. If we add analytics or advertising cookies, we will implement a consent mechanism that defaults to off, obtain prior consent where the law requires it, and honor withdrawal.',
      },
      {
        type: 'p',
        text: 'Customers who embed or link to their own content inside a BloomAR workspace, or who put their own tracking on pages they control, are responsible for their own cookie notices and consents. BloomAR does not permit third-party tracking scripts to be injected into the application, and we do not provide a facility for doing so.',
      },
      { type: 'h2', text: 'Changes to this policy' },
      {
        type: 'p',
        text: 'We will update this policy before we change what we store in your browser, and we will update the "Last updated" date. Because this policy lists every cookie and storage key by name, a material change will always be visible here rather than buried in a privacy policy.',
      },
      { type: 'h2', text: 'Contact' },
      {
        type: 'address',
        lines: [
          `${entityFullName(E)}`,
          'Attn: Privacy',
          'Email: [[PRIVACY_EMAIL]]',
          'Support: [[SUPPORT_EMAIL]]',
        ],
      },
      {
        type: 'callout',
        tone: 'info',
        title: 'How this page is kept accurate',
        text:
          'This list was produced by inspecting the deployed application\u2019s cookie configuration, browser-storage usage, and third-party script loading. If a new integration is added to the codebase, this policy is out of date until it is updated — that review is part of the release checklist.',
      },
    ],
  };
}
