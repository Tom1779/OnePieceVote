"use client";

import { Shield, ArrowLeft } from "lucide-react";
import Link from "next/link";

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
                  <li>
                    We do not have access to your password as it is encrypted
                  </li>
                  <li>
                    Voting history (to limit accounts to 5 votes a day and
                    prevent bot spamming)
                  </li>
                  <li>
                    Session information (to keep you logged in next time you
                    return to the website)
                  </li>
                  <li>
                    Note that Session information is stored for 7 days and then
                    deleted, as such you will have to sign in again after a week
                  </li>
                  <li>
                    This project uses{" "}
                    <Link
                      className="text-blue-200"
                      href="https://supabase.com/docs"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {" "}
                      Supabase{" "}
                    </Link>{" "}
                    as the storage database
                  </li>
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
                    WE DO NOT SELL OR OTHERWISE DISTRIBUTE ANY OF YOUR DATA
                  </li>
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
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">
                  As we would prefer to not be contacted with questions, we made
                  it so every account has all of its information deleted after 7
                  days of not being signed in. So there will be no need to ask
                  us to delete your account.
                </h2>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-3">
                  Special Thanks
                </h2>
                <p className="mb-3">
                  All character data was collected from the{" "}
                  <Link
                    className="text-blue-200"
                    href="https://onepiece.fandom.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    One Piece Wiki
                  </Link>
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
