import React from "react";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center p-6">
      <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg max-w-3xl w-full p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Privacy Policy — Resumail</h1>
        <p className="text-gray-500 mb-6">Last updated: October 2025</p>

        <div className="space-y-6 text-gray-700 leading-relaxed">
          <p>
            At <strong>Pink Filly</strong>, we respect your privacy and are committed to protecting
            your personal information. This policy explains how Resumail handles user data.
          </p>

          <section>
            <h2 className="text-xl font-semibold text-purple-700 mb-2">1. Data Collection</h2>
            <p>
              Resumail only accesses your Gmail inbox when you explicitly grant permission
              through Google OAuth. The app reads email content to generate summaries,
              sentiment analyses, and insights using AI.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-purple-700 mb-2">2. Data Storage</h2>
            <p>
              Email data is processed temporarily and not stored permanently.
              Only aggregate results and statistics may be retained for user convenience.
              We never sell or share your data with third parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-purple-700 mb-2">3. Security</h2>
            <p>
              All data transmissions are encrypted and comply with Google’s API usage policies.
              Access to Resumail requires secure authentication through your Google account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-purple-700 mb-2">4. Third-Party Services</h2>
            <p>
              Resumail may use third-party analytics or hosting providers (such as Supabase and Vercel)
              to operate efficiently. These services do not have access to your email data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-purple-700 mb-2">5. User Rights</h2>
            <p>
              You can revoke Resumail’s access to your Gmail data at any time through your
              Google account settings. To request deletion of your account or any associated data,
              please contact us directly.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-purple-700 mb-2">6. Contact</h2>
            <p>
              For privacy concerns or data-related questions, contact us at:{" "}
              <a
                href="mailto:pinkfillysaas@gmail.com"
                className="text-purple-600 hover:underline font-medium"
              >
                pinkfillysaas@gmail.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
