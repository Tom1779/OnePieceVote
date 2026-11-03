"use client";

import { Shield } from "lucide-react";
import Link from "next/link";
import Head from "next/head";
import PageShell from "../components/PageShell";

export default function PrivacyPage() {
  return (
    <>
      <Head>
        <title>Privacy Policy - One Piece Character Voting</title>
        <meta
          name="description"
          content="Privacy policy and data handling information"
        />
        <link rel="canonical" href="https://www.onepiecevoting.com/privacy" />
        <meta
          property="og:title"
          content="Privacy Policy - One Piece Character Voting"
        />
        <meta
          property="og:url"
          content="https://www.onepiecevoting.com/privacy"
        />
      </Head>
      <PageShell wide={false}>
          <div className="paper">
            <div className="p-6 sm:p-10">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="text-blood h-8 w-8" />
                <h1 className="font-display text-3xl sm:text-4xl">
                  Privacy Policy
                </h1>
              </div>

              <div className="space-y-6 text-lg text-ink-soft">
                <section>
                  <h2 className="font-display text-2xl text-ink mb-3">
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
                      Note that Session information is stored for 7 days and
                      then deleted, as such you will have to sign in again after
                      a week
                    </li>
                    <li>
                      This project uses{" "}
                      <Link
                        className="font-bold text-blood underline"
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
                  <h2 className="font-display text-2xl text-ink mb-3">
                    How We Use Your Information
                  </h2>
                  <p className="mb-3">We use your information to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      Authenticate your identity and maintain your account
                    </li>
                    <li>
                      Track and limit daily voting as per our platform rules
                    </li>
                    <li>
                      WE DO NOT SELL OR OTHERWISE DISTRIBUTE ANY OF YOUR DATA
                    </li>
                  </ul>
                </section>

                <section>
                  <h2 className="font-display text-2xl text-ink mb-3">
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
                      We use Supabase, a secure authentication provider, to
                      manage user accounts
                    </li>
                    <li>
                      All data is transmitted over secure HTTPS connections
                    </li>
                  </ul>
                </section>

                <section>
                  <h2 className="font-display text-2xl text-ink mb-3">
                    As we would prefer to not be contacted with questions, we
                    made it so every account has all of its information deleted
                    after 7 days of not being signed in. So there will be no
                    need to ask us to delete your account.
                  </h2>
                </section>

                <section>
                  <h2 className="font-display text-2xl text-ink mb-3">
                    Special Thanks
                  </h2>
                  <p className="mb-3">
                    All character data was collected from the{" "}
                    <Link
                      className="font-bold text-blood underline"
                      href="https://onepiece.fandom.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      One Piece Wiki
                    </Link>
                  </p>
                </section>

                <section className="pt-4 border-t border-ink/20">
                  <p className="text-sm text-ink-faint">
                    Last updated: {new Date().toLocaleDateString()}
                  </p>
                </section>
              </div>
            </div>
          </div>
      </PageShell>
    </>
  );
}
