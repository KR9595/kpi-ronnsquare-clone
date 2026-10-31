/**
 * Legal Notice and Privacy Policy sections, as the source's `/wp-json/rs/v1/legal?doc=…&lang=en`
 * endpoint returns them (fetched once and stored here, so the modals never hit the network).
 * Links to other pages are turned into `#`; `mailto:` / `tel:` links stay real.
 */
export interface LegalSection {
  slug: string
  title: string
  /** Trusted HTML from the source's CMS. */
  body: string
}

export type LegalDoc = 'legal' | 'privacy'

export const legalSections: Record<LegalDoc, LegalSection[]> = {
  legal: [
    {
      slug: 'Website Publisher',
      title: 'Website Publisher',
      body: '<p>This website is published by:</p>\n<p>RONNSQUARE<br />\nShare capital: €1,000,000.00<br />\nRCS PARIS: 444 996 268<br />\nSIRET : 44499626800033<br />\nEU VAT number: FR29444996268</p>\n<p>Registered office:<br />\n25 rue du 4 Septembre<br />\n75002 Paris – France</p>\n<p>Publication Director: Daniel Roncoroni</p>',
    },
    {
      slug: 'Web Hosting',
      title: 'Web Hosting',
      body: '<p>This website is hosted by:</p>\n<p><a href="#">o2switch</a><br />\n222 Boulevard Gustave Flaubert<br />\n63000 Clermont-Ferrand – France</p>',
    },
    {
      slug: 'Website Design and Management',
      title: 'Website Design and Management',
      body: '<p>This website was created and is managed by:</p>\n<p>Colibrity Agency<br />\nWebsite: <strong><a href="#">colibrity.com</a></strong></p>',
    },
    {
      slug: 'Third-Party Tools and Services',
      title: 'Third-Party Tools and Services',
      body: '<p>This website uses the following third-party tools:</p>\n<ul>\n<li>Google Analytics – audience analytics tool (Google LLC, United States)audience analytics tool (Google LLC, United States)<br />\n• Google Tag Manager – tag management system (Google LLC, United States)<br />\n• Microsoft Clarity – outil dbehavioural analytics tool (Microsoft Corporation, United States)<br />\n• Axeptio – cookie consent management platform (Axeptio SAS, France)</li>\n</ul>\n<p>These tools are governed by their own privacy policies. User consent is collected via Axeptio in compliance with the GDPR prior to any non-essential cookie being placed.</p>',
    },
    {
      slug: 'Intellectual Property',
      title: 'Intellectual Property',
      body: '<p>All content on this website (text, images, videos, logos, graphics, documents and visual elements) is the exclusive property of Ronnsquare or its partners.</p>\n<p>Any reproduction, distribution or use, in whole or in part, without prior written authorisation is strictly prohibited.</p>',
    },
    {
      slug: 'Liability',
      title: 'Liability',
      body: '<p>Ronnsquare makes every effort to ensure the accuracy of the information published on this website. However, no guarantee is given as to its completeness or continuous updating.</p>\n<p>Ronnsquare shall not be held liable for any direct or indirect damages arising from the use of this website<strong>.</strong></p>',
    },
  ],
  privacy: [
    {
      slug: '1. Data Controller',
      title: '1. Data Controller',
      body: '<p>The data controller for personal data collected through this website is:</p>\n<p>RONNSQUARE<br />\nShare capital: €1,000,000.00<br />\nRCS PARIS: 444 996 268<br />\nSIRET: 44499626800033<br />\n25 rue du 4 Septembre, 75002 Paris – France<br />\nEmail: <strong><a href="mailto:contact@ronnsquare.com">contact@ronnsquare.com</a></strong><br />\nTel: <strong><a href="tel:01 83 68 00 04">01 83 68 00 04</a></strong></p>',
    },
    {
      slug: '2. Personal Data Collected',
      title: '2. Personal Data Collected',
      body: '<p>We collect the following data:</p>\n<ul>\n<li>Via contact forms: first name, last name, email address, phone number, message.</li>\n<li>Browsing data: IP address, pages visited, session duration, browser and device type (via Google Analytics and Microsoft Clarity).</li>\n<li>Behavioural data: session recordings and heatmaps (via Microsoft Clarity, with consent).</li>\n<li>Cookie preferences: consent recorded via Axeptio.</li>\n</ul>',
    },
    {
      slug: '3. Purposes and Legal Bases',
      title: '3. Purposes and Legal Bases',
      body: '<p>Your data is processed for the following purposes:</p>\n<p><strong>Processing contact requests</strong> – Legal basis: legitimate interest / pre-contractual execution.</p>\n<p><strong>Audience analysis and website improvement</strong> (Google Analytics, Microsoft Clarity) – Legal basis: consent.</p>\n<p><strong>Marketing and analytics tag management</strong> (Google Tag Manager) – Legal basis: consent.</p>\n<p><strong>Cookie consent management</strong> (Axeptio) – Legal basis: legal obligation (GDPR, ePrivacy Directive).</p>',
    },
    {
      slug: '4. Cookies and Similar Technologies',
      title: '4. Cookies and Similar Technologies',
      body: '<p>This website uses cookies. On your first visit, a consent banner managed by Axeptio allows you to accept or decline non-essential cookies.</p>\n<p><strong>Cookies in use:</strong></p>\n<ul>\n<li>Strictly necessary cookies: website operation, consent preference storage (Axeptio). No consent required.</li>\n<li>Analytics cookies – Google Analytics: audience measurement and traffic statistics (Google LLC, United States). Consent required.</li>\n<li>Tag management cookies – Google Tag Manager: conditional script activation based on consent (Google LLC). Consent required.</li>\n<li>Behavioural cookies – Microsoft Clarity: session recordings and heatmaps (Microsoft Corporation, United States). Consent required.</li>\n</ul>\n<p>You may update your cookie preferences at any time by clicking <a href="#">this link</a>.</p>',
    },
    {
      slug: '5. International Data Transfers',
      title: '5. International Data Transfers',
      body: '<p>Some providers (Google LLC, Microsoft Corporation) are based in the United States. These transfers are governed by the European Commission’s Standard Contractual Clauses and/or the EU-US Data Privacy Framework. Axeptio is a French provider; consent data remains within the European Union.</p>',
    },
    {
      slug: '6. Data Retention',
      title: '6. Data Retention',
      body: '<ul>\n<li>Contact data: 3 years from the last contact.</li>\n<li>Analytics data (Google Analytics): up to 26 months.</li>\n<li>Session recordings (Microsoft Clarity): 30 days.</li>\n<li>Cookie consent (Axeptio): 13 months.</li>\n</ul>',
    },
    {
      slug: '7. Your Rights',
      title: '7. Your Rights',
      body: '<p>In accordance with the GDPR (Regulation (EU) 2016/679), you have the following rights:</p>\n<ul>\n<li>Right of access to your personal data.</li>\n<li>Right to rectification of inaccurate or incomplete data.</li>\n<li>Right to erasure (“right to be forgotten”).</li>\n<li>Right to restriction of processing.</li>\n<li>Right to object to processing.</li>\n<li>Right to data portability.</li>\n<li>Right to withdraw consent at any time, without affecting the lawfulness of processing carried out prior to withdrawal.</li>\n</ul>\n<p>To exercise your rights, please contact us:</p>\n<ul>\n<li>By email: <strong><a href="mailto:contact@ronnsquare.com">contact@ronnsquare.com</a></strong></li>\n<li>By post: RONNSQUARE, 25 rue du 4 Septembre, 75002 Paris – France</li>\n</ul>\n<p>You also have the right to lodge a complaint with the CNIL (French data protection authority): www.cnil.fr</p>',
    },
    {
      slug: '8. Website Design and Management',
      title: '8. Website Design and Management',
      body: '<p>This website was designed and is managed by Colibrity Agency (colibrity.com). As a technical service provider, Colibrity Agency acts as a data processor within the meaning of the GDPR and processes data solely in accordance with RONNSQUARE’s instructions.</p>',
    },
    {
      slug: '9. Security',
      title: '9. Security',
      body: '<p>We implement appropriate technical and organisational measures to protect your data against unauthorised access, loss, accidental destruction or disclosure. The website is hosted by o2switch (Clermont-Ferrand, France), a certified hosting provider subject to French law.</p>',
    },
    {
      slug: '10. Updates to this Policy',
      title: '10. Updates to this Policy',
      body: '<p>We reserve the right to update this Privacy Policy at any time, in particular to comply with changes in law or our data practices. The date of the last update is shown at the top of this document.</p>\n<p><strong>Contact</strong></p>\n<p><a href="tel:01 83 68 00 04"><strong>01 83 68 00 04</strong></a></p>\n<p><a href="mailto:contact@ronnsquare.com"><strong>contact@ronnsquare.com</strong></a></p>\n<p><strong>25 rue du 4 Septembre – 75002 Paris</strong></p>',
    },
  ],
}
