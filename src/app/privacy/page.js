"use client";

import { Shield } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <nav className="bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14 sm:h-16 items-center">
            <Link
              href="/"
              className="flex items-center gap-1 sm:gap-2 text-blue-400 hover:text-blue-300 transition-colors"
            >
              <ArrowLeft size={18} />
              <span className="text-sm sm:text-base">Back to Voting</span>
            </Link>
            <div className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Privacy
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-2xl border border-gray-700 overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="text-blue-400 h-8 w-8" />
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                Privacy Policy
              </h1>
            </div>

            <div className="space-y-6 text-gray-300">
              <section>
                <h2 className="text-xl font-semibold text-white mb-3">
                  Information We Collect
                </h2>
                <p className="mb-3">
                  When you use our One Piece Character Voting website, we
                  collect and process the following information:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Your email address (for authentication purposes)</li>
                  <li>Voting history (to maintain voting integrity)</li>
                  <li>Session information (to manage your login status)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">
                  How We Use Your Information
                </h2>
                <p className="mb-3">We use your information to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Authenticate your identity and maintain your account</li>
                  <li>
                    Track and limit daily voting as per our platform rules
                  </li>
                  <li>
                    Prevent duplicate voting and maintain voting integrity
                  </li>
                  <li>Improve our website and user experience</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">
                  Data Security
                </h2>
                <p className="mb-3">
                  We take your data security seriously. Here's how we protect
                  your information:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    All passwords are encrypted and we never store plain-text
                    passwords
                  </li>
                  <li>
                    We use Supabase, a secure authentication provider, to manage
                    user accounts
                  </li>
                  <li>All data is transmitted over secure HTTPS connections</li>
                  <li>
                    We regularly update our security measures to protect against
                    unauthorized access
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">
                  Your Rights
                </h2>
                <p className="mb-3">You have the right to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Access your personal data</li>
                  <li>Request deletion of your account and associated data</li>
                  <li>Opt-out of any non-essential communications</li>
                  <li>Request a copy of your voting history</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">
                  Contact Us
                </h2>
                <p>
                  If you have any questions about our privacy policy or how we
                  handle your data, please contact us at [Your Contact Email].
                </p>
              </section>

              <section className="pt-4 border-t border-gray-700">
                <p className="text-sm text-gray-400">
                  Last updated: {new Date().toLocaleDateString()}
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
