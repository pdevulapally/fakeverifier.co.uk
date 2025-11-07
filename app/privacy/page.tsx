export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8 sm:p-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
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
              FakeVerifier ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information when you use our website, services, and applications (collectively, the "Service").
            </p>
            <p className="text-gray-700 leading-relaxed mt-4">
              We comply with the UK General Data Protection Regulation (UK GDPR), the EU General Data Protection Regulation (GDPR), and the Data Protection Act 2018. This policy explains your rights regarding your personal data.
            </p>
            <p className="text-gray-700 leading-relaxed mt-4">
              By using our Service, you agree to the collection and use of information in accordance with this Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. Data Controller</h2>
            <p className="text-gray-700 leading-relaxed">
              For the purposes of UK GDPR and EU GDPR, FakeVerifier is the data controller responsible for your personal data. Our contact information is:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mt-4">
              <p className="text-gray-700"><strong>Email:</strong> <a href="mailto:PreethamDevulapally@gmail.com" className="text-blue-600 hover:underline">PreethamDevulapally@gmail.com</a></p>
              <p className="text-gray-700 mt-2"><strong>Website:</strong> <a href="/contact" className="text-blue-600 hover:underline">Contact Us</a></p>
            </div>
          </section>

          <section>
            <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-bold text-red-900 mb-3">⚠️ CRITICAL WARNING</h3>
              <p className="text-red-800 font-semibold mb-2">
                DO NOT SUBMIT PERSONAL OR SENSITIVE INFORMATION
              </p>
              <p className="text-red-700 leading-relaxed mb-3">
                <strong>You must NOT submit any personal details, sensitive information, private data, financial information, passwords, social security numbers, bank account details, or any confidential information</strong> through this Service. We cannot guarantee the security or confidentiality of any information you submit, and we are not responsible for any loss or damage resulting from such submissions.
              </p>
              <p className="text-red-800 font-semibold mb-2">
                SERVICE IS NOT RELIABLE
              </p>
              <p className="text-red-700 leading-relaxed">
                This Service is provided for informational purposes only and is <strong>NOT RELIABLE</strong>. Verification results may be inaccurate, incomplete, or incorrect. Do not rely on this Service for critical decisions or important matters.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">3.1 Information You Provide</h3>
            <p className="text-gray-700 leading-relaxed">We collect information that you voluntarily provide to us, including:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-4">
              <li><strong>Account Information:</strong> Name, email address, password (hashed), and profile information</li>
              <li><strong>Content:</strong> Information, text, or content you submit for verification</li>
              <li><strong>Payment Information:</strong> Billing address and payment method details (processed by third-party payment processors)</li>
              <li><strong>Communications:</strong> Messages, feedback, and correspondence you send to us</li>
            </ul>
            <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 mt-4">
              <p className="text-yellow-800 text-sm font-semibold">
                ⚠️ WARNING: Do not submit personal details, sensitive information, or confidential data. This Service is not secure for handling such information.
              </p>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">3.2 Automatically Collected Information</h3>
            <p className="text-gray-700 leading-relaxed">When you use our Service, we automatically collect certain information, including:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-4">
              <li><strong>Usage Data:</strong> Pages visited, features used, time spent, and interaction patterns</li>
              <li><strong>Device Information:</strong> Device type, operating system, browser type, and device identifiers</li>
              <li><strong>Log Data:</strong> IP address, access times, error logs, and referral URLs</li>
              <li><strong>Cookies and Tracking Technologies:</strong> As described in our Cookie Policy (Section 8)</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">3.3 Information from Third Parties</h3>
            <p className="text-gray-700 leading-relaxed">We may receive information from third-party services, including:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-4">
              <li>Authentication providers (e.g., Google) when you sign in using third-party accounts</li>
              <li>Payment processors for transaction information</li>
              <li>Analytics and monitoring services</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. How We Use Your Information</h2>
            <p className="text-gray-700 leading-relaxed">We use your personal information for the following purposes:</p>
            
            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">4.1 Service Provision</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>To provide, maintain, and improve our Service</li>
              <li>To process your verification requests and deliver results</li>
              <li>To manage your account and authenticate your identity</li>
              <li>To process payments and manage subscriptions</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">4.2 Communication</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>To send you service-related notifications and updates</li>
              <li>To respond to your inquiries and provide customer support</li>
              <li>To send you marketing communications (with your consent, which you can withdraw at any time)</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">4.3 Legal Basis (GDPR)</h3>
            <p className="text-gray-700 leading-relaxed">We process your personal data based on the following legal bases:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-4">
              <li><strong>Contract Performance:</strong> To fulfill our contractual obligations to you</li>
              <li><strong>Legitimate Interests:</strong> To improve our Service, prevent fraud, and ensure security</li>
              <li><strong>Consent:</strong> For marketing communications and non-essential cookies</li>
              <li><strong>Legal Obligation:</strong> To comply with applicable laws and regulations</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">4.4 Analytics and Improvement</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>To analyse usage patterns and improve user experience</li>
              <li>To detect, prevent, and address technical issues and security threats</li>
              <li>To conduct research and development</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. How We Share Your Information</h2>
            <p className="text-gray-700 leading-relaxed">We do not sell your personal information. We may share your information in the following circumstances:</p>
            
            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">5.1 Service Providers</h3>
            <p className="text-gray-700 leading-relaxed">We may share information with third-party service providers who perform services on our behalf, including:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-4">
              <li>Cloud hosting and infrastructure providers</li>
              <li>Payment processors</li>
              <li>Analytics and monitoring services</li>
              <li>Email and communication services</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              These service providers are contractually obligated to protect your information and use it only for the purposes we specify.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">5.2 Legal Requirements</h3>
            <p className="text-gray-700 leading-relaxed">We may disclose your information if required by law or in response to:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-4">
              <li>Legal processes, such as court orders or subpoenas</li>
              <li>Government requests or regulatory requirements</li>
              <li>To protect our rights, property, or safety, or that of our users</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">5.3 Business Transfers</h3>
            <p className="text-gray-700 leading-relaxed">
              In the event of a merger, acquisition, or sale of assets, your information may be transferred to the acquiring entity, subject to the same privacy protections.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">5.4 With Your Consent</h3>
            <p className="text-gray-700 leading-relaxed">
              We may share your information with third parties when you have given us explicit consent to do so.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. Data Retention</h2>
            <p className="text-gray-700 leading-relaxed">
              We retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-4">
              <li><strong>Account Data:</strong> Retained while your account is active and for up to 30 days after account deletion</li>
              <li><strong>Verification History:</strong> Retained according to your account settings and subscription plan</li>
              <li><strong>Payment Records:</strong> Retained for 7 years as required by UK tax and accounting laws</li>
              <li><strong>Legal Records:</strong> Retained as required by applicable laws and regulations</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              When we no longer need your information, we will securely delete or anonymise it.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">7. Data Security</h2>
            <p className="text-gray-700 leading-relaxed">
              We implement appropriate technical and organisational measures to protect your personal information against unauthorised access, alteration, disclosure, or destruction. These measures include:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-4">
              <li>Encryption of data in transit and at rest</li>
              <li>Regular security assessments and updates</li>
              <li>Access controls and authentication mechanisms</li>
              <li>Employee training on data protection</li>
              <li>Incident response procedures</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">8. Cookies and Tracking Technologies</h2>
            <p className="text-gray-700 leading-relaxed">
              We use cookies and similar tracking technologies to track activity on our Service and store certain information. Cookies are small data files stored on your device.
            </p>
            
            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Types of Cookies We Use:</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>Essential Cookies:</strong> Necessary for the Service to function (cannot be disabled)</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how users interact with our Service</li>
              <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
              <li><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements (with your consent)</li>
            </ul>
            
            <p className="text-gray-700 leading-relaxed mt-4">
              You can control cookies through your browser settings. However, disabling certain cookies may affect the functionality of our Service.
            </p>
            <p className="text-gray-700 leading-relaxed mt-4">
              For more information about our use of cookies, please see our Cookie Policy, which is available in your account settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">9. Your Rights (GDPR)</h2>
            <p className="text-gray-700 leading-relaxed">
              Under UK GDPR and EU GDPR, you have the following rights regarding your personal data:
            </p>
            
            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">9.1 Right of Access</h3>
            <p className="text-gray-700 leading-relaxed">
              You have the right to request a copy of the personal information we hold about you.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">9.2 Right to Rectification</h3>
            <p className="text-gray-700 leading-relaxed">
              You have the right to request correction of inaccurate or incomplete personal information.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">9.3 Right to Erasure ("Right to be Forgotten")</h3>
            <p className="text-gray-700 leading-relaxed">
              You have the right to request deletion of your personal information in certain circumstances.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">9.4 Right to Restrict Processing</h3>
            <p className="text-gray-700 leading-relaxed">
              You have the right to request that we limit how we use your personal information.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">9.5 Right to Data Portability</h3>
            <p className="text-gray-700 leading-relaxed">
              You have the right to receive your personal information in a structured, commonly used, and machine-readable format.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">9.6 Right to Object</h3>
            <p className="text-gray-700 leading-relaxed">
              You have the right to object to processing of your personal information for direct marketing or legitimate interests.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">9.7 Right to Withdraw Consent</h3>
            <p className="text-gray-700 leading-relaxed">
              Where processing is based on consent, you have the right to withdraw your consent at any time.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">9.8 Right to Lodge a Complaint</h3>
            <p className="text-gray-700 leading-relaxed">
              You have the right to lodge a complaint with a supervisory authority if you believe we have violated your data protection rights. In the UK, this is the Information Commissioner's Office (ICO). In the EU, you can contact your local data protection authority.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
              <p className="text-blue-900 font-semibold mb-2">How to Exercise Your Rights</p>
              <p className="text-blue-800 text-sm">
                To exercise any of these rights, please contact us at <a href="mailto:PreethamDevulapally@gmail.com" className="underline">PreethamDevulapally@gmail.com</a>. We will respond to your request within one month (or two months for complex requests) as required by GDPR.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">10. International Data Transfers</h2>
            <p className="text-gray-700 leading-relaxed">
              Your information may be transferred to and processed in countries outside the UK and European Economic Area (EEA). When we transfer data internationally, we ensure appropriate safeguards are in place, such as:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-4">
              <li>Standard Contractual Clauses approved by the European Commission</li>
              <li>Adequacy decisions by the European Commission</li>
              <li>Other legally recognised transfer mechanisms</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">11. Children's Privacy</h2>
            <p className="text-gray-700 leading-relaxed">
              Our Service is not intended for children under 18 years of age. We do not knowingly collect personal information from children under 18. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.
            </p>
            <p className="text-gray-700 leading-relaxed mt-4">
              If we become aware that we have collected personal information from a child under 18 without parental consent, we will take steps to delete such information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">12. Changes to This Privacy Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any material changes by:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-4">
              <li>Posting the updated Privacy Policy on this page</li>
              <li>Updating the "Last updated" date</li>
              <li>Sending you an email notification (for significant changes)</li>
              <li>Displaying a notice on our Service</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              Your continued use of the Service after such changes constitutes acceptance of the updated Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">13. Contact Us</h2>
            <p className="text-gray-700 leading-relaxed">
              If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mt-4">
              <p className="text-gray-700"><strong>Email:</strong> <a href="mailto:PreethamDevulapally@gmail.com" className="text-blue-600 hover:underline">PreethamDevulapally@gmail.com</a></p>
              <p className="text-gray-700 mt-2"><strong>Website:</strong> <a href="/contact" className="text-blue-600 hover:underline">Contact Us</a></p>
            </div>
            <p className="text-gray-700 leading-relaxed mt-4">
              You also have the right to contact your local data protection authority:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-4">
              <li><strong>UK:</strong> Information Commissioner's Office (ICO) - <a href="https://ico.org.uk" className="text-blue-600 hover:underline">ico.org.uk</a></li>
              <li><strong>EU:</strong> Your local data protection authority (find yours at <a href="https://edpb.europa.eu" className="text-blue-600 hover:underline">edpb.europa.eu</a>)</li>
            </ul>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center">
            This Privacy Policy is effective as of the date stated above and applies to all users of FakeVerifier.
          </p>
        </div>
      </div>
    </div>
  );
}

