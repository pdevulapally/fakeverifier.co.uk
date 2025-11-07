export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8 sm:p-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Terms and Conditions</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: {new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        {/* Data Protection Notice */}
        <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6 mb-8">
          <p className="text-green-800 text-base font-semibold mb-3">
            🔒 Your Data Protection
          </p>
          <ul className="text-green-700 text-sm space-y-2 list-disc list-inside">
            <li>We do not share or sell any data</li>
            <li>We process data according to UK and European laws</li>
            <li>Data is encrypted and securely stored</li>
            <li>We only share data with your consent, if required by law, or in unforeseen circumstances</li>
          </ul>
        </div>

        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. Introduction</h2>
            <p className="text-gray-700 leading-relaxed">
              Welcome to FakeVerifier ("we," "our," or "us"). These Terms and Conditions ("Terms") govern your access to and use of our website, services, and applications (collectively, the "Service"). By accessing or using our Service, you agree to be bound by these Terms.
            </p>
            <p className="text-gray-700 leading-relaxed mt-4">
              If you do not agree to these Terms, you must not use our Service. We may update these Terms from time to time, and your continued use of the Service after such changes constitutes acceptance of the updated Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. Definitions</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>"Service"</strong> means the FakeVerifier platform, including all features, functionality, and content.</li>
              <li><strong>"User"</strong> or <strong>"You"</strong> means any individual or entity that accesses or uses the Service.</li>
              <li><strong>"Content"</strong> means any text, images, data, or other materials submitted through the Service.</li>
              <li><strong>"Account"</strong> means a registered user account on the Service.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. Eligibility and Account Registration</h2>
            <p className="text-gray-700 leading-relaxed">
              To use our Service, you must:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-4">
              <li>Be at least 18 years of age, or have the consent of a parent or guardian if you are under 18</li>
              <li>Provide accurate, current, and complete information during registration</li>
              <li>Maintain and update your account information to keep it accurate</li>
              <li>Maintain the security of your account credentials</li>
              <li>Be responsible for all activities that occur under your account</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              You agree to notify us immediately of any unauthorised use of your account or any other breach of security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. Acceptable Use</h2>
            <p className="text-gray-700 leading-relaxed">
              You agree not to use the Service:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-4">
              <li>For any unlawful purpose or in violation of any applicable laws or regulations</li>
              <li>To transmit, distribute, or store any material that is defamatory, obscene, harassing, or otherwise objectionable</li>
              <li>To infringe upon the intellectual property rights of others</li>
              <li>To attempt to gain unauthorised access to any part of the Service or its related systems</li>
              <li>To interfere with or disrupt the Service or servers connected to the Service</li>
              <li>To use automated systems (bots, scrapers, etc.) to access the Service without our express written permission</li>
              <li>To impersonate any person or entity or misrepresent your affiliation with any person or entity</li>
            </ul>
          </section>

          <section>
            <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-bold text-red-900 mb-3">⚠️ IMPORTANT WARNING</h3>
              <p className="text-red-800 font-semibold mb-2">
                DO NOT SHARE PERSONAL DETAILS OR SENSITIVE INFORMATION
              </p>
              <p className="text-red-700 leading-relaxed mb-3">
                You should <strong>NOT</strong> submit any personal details, sensitive information, private data, financial information, passwords, or any confidential information through this Service. We are not responsible for any loss or damage resulting from the submission of such information.
              </p>
              <p className="text-red-800 font-semibold mb-2">
                SERVICE RELIABILITY DISCLAIMER
              </p>
              <p className="text-red-700 leading-relaxed">
                This Service is provided for informational purposes only and is <strong>NOT RELIABLE</strong> for making critical decisions. Verification results may be inaccurate, incomplete, or incorrect. Always verify important information through official and trusted sources.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. Service Description</h2>
            <p className="text-gray-700 leading-relaxed">
              FakeVerifier provides an AI-powered service to help users verify the authenticity of information, news, and content. We use various technologies and data sources to provide verification results. However:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-4">
              <li>Our Service is provided "as is" and "as available" without warranties of any kind</li>
              <li>We do not guarantee the accuracy, completeness, or reliability of verification results</li>
              <li><strong>The Service is NOT RELIABLE</strong> and verification results may contain errors or inaccuracies</li>
              <li>Verification results are for informational purposes only and should not be the sole basis for important decisions</li>
              <li><strong>DO NOT submit personal details, sensitive information, or confidential data</strong> through this Service</li>
              <li>We reserve the right to modify, suspend, or discontinue any aspect of the Service at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. Intellectual Property Rights</h2>
            <p className="text-gray-700 leading-relaxed">
              The Service and its original content, features, and functionality are owned by FakeVerifier and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
            </p>
            <p className="text-gray-700 leading-relaxed mt-4">
              You retain ownership of any content you submit through the Service. By submitting content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and display such content solely for the purpose of providing the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">7. Subscription Plans and Payment</h2>
            <p className="text-gray-700 leading-relaxed">
              We offer various subscription plans with different features and usage limits. By subscribing to a paid plan:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-4">
              <li>You agree to pay all fees associated with your chosen plan</li>
              <li>Fees are charged in advance on a recurring basis (monthly or annually)</li>
              <li>All fees are non-refundable except as required by UK or EU law</li>
              <li>We reserve the right to change our pricing with 30 days' notice</li>
              <li>You may cancel your subscription at any time, but you will not receive a refund for the current billing period</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              In accordance with UK Consumer Contracts Regulations 2013 and EU Directive 2011/83/EU, you have the right to cancel your subscription within 14 days of purchase and receive a full refund, unless you have already used the Service during this period.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">8. Limitation of Liability</h2>
            <p className="text-gray-700 leading-relaxed">
              To the maximum extent permitted by applicable law:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-4">
              <li>We shall not be liable for any indirect, incidental, special, consequential, or punitive damages</li>
              <li>Our total liability for any claims arising from your use of the Service shall not exceed the amount you paid us in the 12 months preceding the claim</li>
              <li>We do not warrant that the Service will be uninterrupted, secure, or error-free</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              Nothing in these Terms excludes or limits our liability for death or personal injury caused by our negligence, fraud, or any other liability that cannot be excluded or limited under applicable UK or EU law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">9. Indemnification</h2>
            <p className="text-gray-700 leading-relaxed">
              You agree to indemnify, defend, and hold harmless FakeVerifier, its officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses (including reasonable legal fees) arising out of or in any way connected with:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-4">
              <li>Your access to or use of the Service</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any rights of another party</li>
              <li>Your violation of any applicable laws or regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">10. Termination</h2>
            <p className="text-gray-700 leading-relaxed">
              We may terminate or suspend your account and access to the Service immediately, without prior notice, for any reason, including:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-4">
              <li>Breach of these Terms</li>
              <li>Fraudulent, abusive, or illegal activity</li>
              <li>Non-payment of fees</li>
              <li>Extended periods of inactivity</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              Upon termination, your right to use the Service will immediately cease. You may terminate your account at any time by contacting us or using the account deletion feature in your settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">11. Data Protection and Privacy</h2>
            <p className="text-gray-700 leading-relaxed">
              Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference. By using the Service, you consent to the collection and use of your information as described in our Privacy Policy.
            </p>
            <p className="text-gray-700 leading-relaxed mt-4">
              We comply with the UK General Data Protection Regulation (UK GDPR) and the EU General Data Protection Regulation (GDPR). You have certain rights regarding your personal data, as detailed in our Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">12. Dispute Resolution</h2>
            <p className="text-gray-700 leading-relaxed">
              If you are a consumer resident in the UK or EU, you have the right to bring proceedings in the courts of your country of residence. For UK residents, these Terms are governed by English law and subject to the exclusive jurisdiction of the English courts.
            </p>
            <p className="text-gray-700 leading-relaxed mt-4">
              We encourage you to contact us first to resolve any disputes. If we cannot resolve a dispute, you may have the right to use the European Commission's Online Dispute Resolution platform or contact your local consumer protection authority.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">13. Changes to Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to modify these Terms at any time. We will notify you of any material changes by:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-4">
              <li>Posting the updated Terms on this page</li>
              <li>Updating the "Last updated" date at the top of this page</li>
              <li>Sending you an email notification (for significant changes)</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              Your continued use of the Service after such changes constitutes acceptance of the updated Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">14. Severability</h2>
            <p className="text-gray-700 leading-relaxed">
              If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary, and the remaining provisions shall remain in full force and effect.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">15. Contact Information</h2>
            <p className="text-gray-700 leading-relaxed">
              If you have any questions about these Terms, please contact us:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mt-4">
              <p className="text-gray-700"><strong>Email:</strong> <a href="mailto:legal@fakeverifier.co.uk" className="text-blue-600 hover:underline">legal@fakeverifier.co.uk</a></p>
              <p className="text-gray-700 mt-2"><strong>Website:</strong> <a href="/contact" className="text-blue-600 hover:underline">Contact Us</a></p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">16. Entire Agreement</h2>
            <p className="text-gray-700 leading-relaxed">
              These Terms, together with our Privacy Policy, constitute the entire agreement between you and FakeVerifier regarding the use of the Service and supersede all prior agreements and understandings.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center">
            By using FakeVerifier, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
          </p>
        </div>
      </div>
    </div>
  );
}

