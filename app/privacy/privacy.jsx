"use client";

export default function PrivacyPage() {
  return (
    <main className="min-h-dvh bg-[#050816] text-white px-6 py-12">
      <div className="max-w-3xl mx-auto space-y-8">
        <header>
          <h1 className="text-3xl font-bold">Privacy Policy</h1>
          <p className="text-gray-400 text-sm mt-2">
            Last updated: {new Date().toDateString()}
          </p>
        </header>

        <section className="space-y-4 text-sm text-gray-300 leading-relaxed">
          <p>
            This Privacy Policy explains how BugReview collects, uses, and
            protects your information when you use our platform.
          </p>

          <h2 className="text-white font-semibold text-lg">
            1. Information We Collect
          </h2>
          <p>We may collect the following information:</p>
          <ul className="list-disc ml-5 space-y-1">
            <li>
              Account information: name, email address, profile image, linked
              provider metadata, and optional GitHub profile details
            </li>
            <li>
              Geographic data: country information (collected through browser
              geolocation API with user permission)
            </li>
            <li>
              Post metadata: timestamps, language preferences, categories,
              solution markers, and blogging preferences you specify
            </li>
            <li>
              Engagement data: likes, bookmarks, shares, and comments on posts
            </li>
            <li>
              Community profile data: achievement milestones, verification
              requests, verification status, and blog author permissions
            </li>
          </ul>

          <h2 className="text-white font-semibold text-lg">2. User Content</h2>
          <p>
            Any content you post (bugs, tutorials, comments, solutions, and
            blog posts) is stored in our database and may be visible to other
            users on the platform.
          </p>

          <h2 className="text-white font-semibold text-lg">
            3. How We Use Data
          </h2>
          <p>We use your data to:</p>
          <ul className="list-disc ml-5 space-y-1">
            <li>Display your posts on the platform</li>
            <li>Authenticate your account</li>
            <li>Improve user experience</li>
            <li>Show linked provider badges and achievement milestones</li>
            <li>Review blog verification requests and manage blog access</li>
          </ul>

          <h2 className="text-white font-semibold text-lg">4. Data Storage</h2>
          <p>
            Your data is stored using Firebase (Google Cloud infrastructure).
            While Firebase provides security protections, no system is 100%
            secure.
          </p>

          <h2 className="text-white font-semibold text-lg">
            4.1 Geolocation Data
          </h2>
          <p>
            When you grant location access to detect your country, your
            coordinates are processed locally in your browser and only the
            derived country name is stored. Raw coordinate data is never sent to
            or stored by our servers. You can deny this permission at any time.
          </p>

          <h2 className="text-white font-semibold text-lg">
            5. Cookies & Sessions
          </h2>
          <p>
            We use authentication sessions to keep you logged in. These may use
            cookies provided by NextAuth or browser storage mechanisms.
          </p>

          <h2 className="text-white font-semibold text-lg">6. Data Sharing</h2>
          <p>
            We do not sell your personal data. We also do not share your
            personal information with third parties except for required
            infrastructure services like Firebase and authentication providers.
            Your public posts, optional GitHub badge links, country information,
            timestamps, and visible achievement indicators are available to
            other platform users when you choose to contribute publicly.
          </p>

          <h2 className="text-white font-semibold text-lg">7. Your Rights</h2>
          <p>
            You can request deletion of your account or content by contacting
            support (future feature if not yet implemented).
          </p>

          <h2 className="text-white font-semibold text-lg">
            7.1 Data Retention
          </h2>
          <p>
            Your posts and associated metadata (including timestamps and country
            information) are retained as long as your account is active. Upon
            account deletion, your personal data may be removed, though posts
            may remain visible if they are public or referenced by other users.
          </p>

          <h2 className="text-white font-semibold text-lg">
            8. Children’s Privacy
          </h2>
          <p>
            This platform is intended for users above 13 years of age. We do not
            knowingly collect data from children under 13.
          </p>

          <h2 className="text-white font-semibold text-lg">9. Changes</h2>
          <p>
            This policy may be updated periodically. Continued use of the
            platform implies acceptance of changes.
          </p>
        </section>
      </div>
    </main>
  );
}
