"use client";

export default function TermsPage() {
  return (
    <main className="min-h-dvh bg-[#050816] text-white px-6 py-12">
      <div className="max-w-3xl mx-auto space-y-8">
        <header>
          <h1 className="text-3xl font-bold">Terms & Conditions</h1>
          <p className="text-gray-400 text-sm mt-2">
            Last updated: {new Date().toDateString()}
          </p>
        </header>

        <section className="space-y-4 text-sm text-gray-300 leading-relaxed">
          <p>
            Welcome to BugReview. By accessing or using this platform, you agree
            to the following terms. If you do not agree, you should discontinue
            use immediately.
          </p>

          <h2 className="text-white font-semibold text-lg">
            1. Platform Purpose
          </h2>
          <p>
            BugReview is a community-based platform where users can post coding
            bugs, tutorials, and technical issues to receive help and share
            knowledge.
          </p>

          <h2 className="text-white font-semibold text-lg">2. User Content</h2>
          <p>
            Users are responsible for any content they upload, including text,
            links, images, and code snippets. You must not post harmful,
            illegal, abusive, or copyrighted content that you do not own or have
            permission to share.
          </p>

          <h2 className="text-white font-semibold text-lg">
            2.1 Location & Metadata
          </h2>
          <p>
            When posting bug reports, you may be asked to grant location access
            to automatically detect your country. This location data is used
            only to populate the country field and enhance post metadata. You
            may decline location access and manually enter your country instead.
          </p>

          <h2 className="text-white font-semibold text-lg">
            3. Account Responsibility
          </h2>
          <p>
            You are responsible for maintaining the security of your account.
            BugReview is not liable for unauthorized access caused by user
            negligence.
          </p>

          <h2 className="text-white font-semibold text-lg">
            4. Content Moderation
          </h2>
          <p>
            We reserve the right to remove any content that violates community
            guidelines or appears harmful, misleading, or spam-related.
          </p>

          <h2 className="text-white font-semibold text-lg">
            5. Service Availability
          </h2>
          <p>
            We do not guarantee uninterrupted access to the platform. The
            service may be updated, modified, or temporarily unavailable at any
            time.
          </p>

          <h2 className="text-white font-semibold text-lg">
            5.1 Post Timestamps
          </h2>
          <p>
            All posts are automatically timestamped when created. These
            timestamps are used to organize posts chronologically and to
            calculate engagement metrics for ranking. Timestamps are displayed
            publicly on your posts.
          </p>

          <h2 className="text-white font-semibold text-lg">
            6. External Links
          </h2>
          <p>
            BugReview may contain links to third-party websites (e.g. YouTube).
            We are not responsible for external content or services.
          </p>

          <h2 className="text-white font-semibold text-lg">
            7. Limitation of Liability
          </h2>
          <p>
            BugReview is provided “as is” without warranties. We are not liable
            for losses or damages resulting from the use of the platform.
          </p>

          <h2 className="text-white font-semibold text-lg">
            8. Changes to Terms
          </h2>
          <p>
            We may update these terms at any time. Continued use of the platform
            means acceptance of the updated terms.
          </p>

          <h2 className="text-white font-semibold text-lg">
            9. User Permissions
          </h2>
          <p>
            During the post creation process, you may be prompted to grant
            permissions (such as location access) to enhance your posting
            experience. These permissions are entirely optional—you can deny
            them and still use the platform by manually entering information
            instead.
          </p>
        </section>
      </div>
    </main>
  );
}
