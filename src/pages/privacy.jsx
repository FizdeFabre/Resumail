import React from "react";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-6">
      <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg max-w-3xl w-full p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Terms of Service — Resumail</h1>
        <p className="text-gray-500 mb-6">Last updated: October 2025</p>

        <div className="space-y-6 text-gray-700 leading-relaxed">
          <p>
            Welcome to <strong>Resumail</strong>, a service developed and operated by Pink Filly.
            By using this application, you agree to the following Terms of Service.
          </p>

          <section>
            <h2 className="text-xl font-semibold text-indigo-700 mb-2">1. Service Description</h2>
            <p>
              Resumail analyzes your Gmail inbox using artificial intelligence to extract summaries,
              insights, and statistics from email data. Access to the service requires authentication via Google.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-indigo-700 mb-2">2. Responsibility</h2>
            <p>
              Resumail is provided “as is” without any warranty of accuracy, availability, or performance.
              Pink Filly shall not be held liable for any loss, damage, or interruption resulting from the use of the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-indigo-700 mb-2">3. User Data</h2>
            <p>
              Emails and their content are temporarily processed for analysis purposes only.
              No permanent storage or resale of user data occurs. All processing follows Google’s API policies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-indigo-700 mb-2">4. Payments and Credits</h2>
            <p>
              Credits purchased via Resumail are non-refundable except in cases of billing error.
              Each credit corresponds to a specific number of analyzed emails.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-indigo-700 mb-2">5. Modifications</h2>
            <p>
              Pink Filly reserves the right to modify these terms or the service at any time.
              Continued use of the service constitutes acceptance of the updated Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-indigo-700 mb-2">6. Contact</h2>
            <p>
              For any inquiries or legal questions, please contact us at:{" "}
              <a
                href="mailto:resumail.saas@gmail.com"
                className="text-indigo-600 hover:underline font-medium"
              >
                resumail.saas@gmail.com

              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
