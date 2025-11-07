export default function CookiePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8 sm:p-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Cookie Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: {new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. Introduction</h2>
            <p className="text-gray-700 leading-relaxed">
              This Cookie Policy explains how FakeVerifier ("we," "our," or "us") uses cookies and similar tracking technologies on our website. This policy should be read alongside our <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>.
            </p>
            <p className="text-gray-700 leading-relaxed mt-4">
              By using our website, you consent to the use of cookies in accordance with this Cookie Policy. You can manage your cookie preferences at any time through the cookie banner or your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. What Are Cookies?</h2>
            <p className="text-gray-700 leading-relaxed">
              Cookies are small text files that are placed on your device (computer, tablet, or mobile) when you visit a website. They are widely used to make websites work more efficiently and provide information to website owners.
            </p>
            <p className="text-gray-700 leading-relaxed mt-4">
              Cookies allow a website to recognize your device and store some information about your preferences or past actions. This helps us provide you with a better experience when you browse our website and allows us to improve our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. Types of Cookies We Use</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">3.1 Essential Cookies</h3>
            <p className="text-gray-700 leading-relaxed">
              Essential cookies are necessary for the website to function properly. These cookies enable core functionality such as security, network management, and accessibility. You cannot opt out of essential cookies as they are required for the website to work.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mt-4">
              <p className="text-sm text-gray-700"><strong>Examples:</strong></p>
              <ul className="list-disc pl-6 space-y-1 text-sm text-gray-700 mt-2">
                <li>Session management cookies</li>
                <li>Authentication cookies</li>
                <li>Security cookies</li>
                <li>Load balancing cookies</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">3.2 Analytics Cookies</h3>
            <p className="text-gray-700 leading-relaxed">
              Analytics cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mt-4">
              <p className="text-sm text-gray-700"><strong>What we collect:</strong></p>
              <ul className="list-disc pl-6 space-y-1 text-sm text-gray-700 mt-2">
                <li>Pages visited and time spent on pages</li>
                <li>Click patterns and navigation paths</li>
                <li>Device and browser information</li>
                <li>General location data (country/city level)</li>
              </ul>
            </div>
            <p className="text-gray-700 leading-relaxed mt-4">
              <strong>You can opt out of analytics cookies</strong> through our cookie preferences or browser settings.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">3.3 Marketing Cookies</h3>
            <p className="text-gray-700 leading-relaxed">
              Marketing cookies are used to track visitors across websites to display relevant advertisements and measure campaign effectiveness. These cookies may be set by us or by third-party advertising partners.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mt-4">
              <p className="text-sm text-gray-700"><strong>What we use them for:</strong></p>
              <ul className="list-disc pl-6 space-y-1 text-sm text-gray-700 mt-2">
                <li>Delivering personalized advertisements</li>
                <li>Tracking campaign performance</li>
                <li>Measuring conversion rates</li>
                <li>Building user profiles for advertising</li>
              </ul>
            </div>
            <p className="text-gray-700 leading-relaxed mt-4">
              <strong>You can opt out of marketing cookies</strong> through our cookie preferences or browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. Third-Party Cookies</h2>
            <p className="text-gray-700 leading-relaxed">
              In addition to our own cookies, we may also use various third-party cookies to report usage statistics, deliver advertisements, and provide other services. These third parties may set their own cookies or similar technologies on your device.
            </p>
            <p className="text-gray-700 leading-relaxed mt-4">
              <strong>Third-party services we may use include:</strong>
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-4">
              <li><strong>Analytics Services:</strong> Google Analytics and similar services to understand website usage</li>
              <li><strong>Advertising Networks:</strong> Third-party ad networks that may display relevant advertisements</li>
              <li><strong>Social Media Platforms:</strong> Social media cookies for sharing and integration features</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              These third parties have their own privacy policies and cookie policies. We encourage you to review them.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. Cookie Duration</h2>
            <p className="text-gray-700 leading-relaxed">
              Cookies can be either "session" cookies or "persistent" cookies:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-4">
              <li><strong>Session Cookies:</strong> Temporary cookies that are deleted when you close your browser. These are typically essential cookies that enable the website to function during your visit.</li>
              <li><strong>Persistent Cookies:</strong> Cookies that remain on your device for a set period or until you delete them. These cookies remember your preferences and settings for future visits.</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              The duration of persistent cookies varies:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-4">
              <li>Essential cookies: Typically expire when you close your browser or after a short period</li>
              <li>Analytics cookies: Usually expire after 12-24 months</li>
              <li>Marketing cookies: May persist for up to 2 years or until you delete them</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. Managing Your Cookie Preferences</h2>
            <p className="text-gray-700 leading-relaxed">
              You have several options for managing cookies:
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">6.1 Cookie Banner</h3>
            <p className="text-gray-700 leading-relaxed">
              When you first visit our website, you'll see a cookie banner where you can:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-4">
              <li>Accept all cookies</li>
              <li>Reject all non-essential cookies</li>
              <li>Customize your preferences for each cookie category</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">6.2 Browser Settings</h3>
            <p className="text-gray-700 leading-relaxed">
              Most web browsers allow you to control cookies through their settings. You can:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-4">
              <li>Block all cookies</li>
              <li>Block third-party cookies</li>
              <li>Delete existing cookies</li>
              <li>Set your browser to notify you when cookies are set</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              <strong>Browser-specific instructions:</strong>
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-4">
              <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data</li>
              <li><strong>Firefox:</strong> Options → Privacy & Security → Cookies and Site Data</li>
              <li><strong>Safari:</strong> Preferences → Privacy → Cookies and website data</li>
              <li><strong>Edge:</strong> Settings → Privacy, search, and services → Cookies and site permissions</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              <strong>Note:</strong> Blocking or deleting cookies may impact your experience on our website. Some features may not function properly if cookies are disabled.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">7. Your Rights (GDPR)</h2>
            <p className="text-gray-700 leading-relaxed">
              Under UK GDPR and EU GDPR, you have the right to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-4">
              <li>Be informed about the use of cookies (this policy)</li>
              <li>Give or withdraw consent for non-essential cookies</li>
              <li>Access information about cookies we use</li>
              <li>Request deletion of cookie data</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              You can exercise these rights at any time through our cookie preferences or by contacting us at <a href="mailto:PreethamDevulapally@gmail.com" className="text-blue-600 hover:underline">PreethamDevulapally@gmail.com</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">8. Updates to This Cookie Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-4">
              <li>Updating the "Last updated" date at the top of this page</li>
              <li>Displaying a notice on our website</li>
              <li>Sending you an email notification (for significant changes)</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              We encourage you to review this Cookie Policy periodically to stay informed about our use of cookies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">9. Contact Us</h2>
            <p className="text-gray-700 leading-relaxed">
              If you have any questions about this Cookie Policy or our use of cookies, please contact us:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mt-4">
              <p className="text-gray-700"><strong>Email:</strong> <a href="mailto:PreethamDevulapally@gmail.com" className="text-blue-600 hover:underline">PreethamDevulapally@gmail.com</a></p>
              <p className="text-gray-700 mt-2"><strong>Website:</strong> <a href="/contact" className="text-blue-600 hover:underline">Contact Us</a></p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">10. Additional Resources</h2>
            <p className="text-gray-700 leading-relaxed">
              For more information about cookies and how to manage them, you can visit:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-4">
              <li><a href="https://www.allaboutcookies.org" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">All About Cookies</a> - General information about cookies</li>
              <li><a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Information Commissioner's Office (ICO)</a> - UK data protection authority</li>
              <li><a href="https://edpb.europa.eu" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">European Data Protection Board</a> - EU data protection information</li>
            </ul>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center">
            This Cookie Policy is effective as of the date stated above and applies to all users of FakeVerifier.
          </p>
        </div>
      </div>
    </div>
  );
}

