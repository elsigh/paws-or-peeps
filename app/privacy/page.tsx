import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | PawsOrPeeps",
  description: "Privacy Policy for PawsOrPeeps",
};

export default function PrivacyPage() {
  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>

      <div className="prose prose-rose max-w-none">
        <h2>1. Information We Collect</h2>
        <p>When you use PawsOrPeeps, we collect:</p>
        <ul>
          <li>
            Account information: email address and authentication details when
            you register
          </li>
          <li>User content: images you upload to our service</li>
          <li>Usage data: how you interact with our service</li>
          <li>
            Device information: browser type, IP address, and device identifiers
          </li>
        </ul>

        <h2>2. How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Provide and maintain our service</li>
          <li>Process and display your uploaded images</li>
          <li>Improve and personalize your experience</li>
          <li>Communicate with you about our service</li>
          <li>Ensure compliance with our terms and policies</li>
        </ul>

        <h2>3. User Content and Privacy</h2>
        <p>When you upload images to PawsOrPeeps:</p>
        <ul>
          <li>You maintain ownership of your content</li>
          <li>
            You assert that you have the right to upload and share the content
          </li>
          <li>
            You understand that we may remove content that violates legal or
            privacy laws
          </li>
          <li>
            You can mark your uploads as private to limit their visibility
          </li>
        </ul>
        <p>
          We take reasonable measures to protect your content, but no internet
          transmission is completely secure.
        </p>

        <h2>4. Information Sharing</h2>
        <p>
          We do not sell your personal information. We may share information:
        </p>
        <ul>
          <li>With service providers who help us operate our platform</li>
          <li>To comply with legal obligations</li>
          <li>With your consent</li>
        </ul>

        <h2>5. Your Rights</h2>
        <p>Depending on your location, you may have rights to:</p>
        <ul>
          <li>Access the personal information we hold about you</li>
          <li>Correct inaccurate information</li>
          <li>Delete your personal information</li>
          <li>Object to or restrict certain processing</li>
          <li>Data portability</li>
        </ul>

        <h2>6. Data Retention</h2>
        <p>
          We retain your information as long as necessary to provide our
          services and comply with legal obligations. You can request deletion
          of your account and associated data at any time.
        </p>

        <h2>7. Children's Privacy</h2>
        <p>
          Our service is not directed to children under 13. We do not knowingly
          collect personal information from children under 13.
        </p>

        <h2>8. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify
          you of any changes by posting the new policy on this page.
        </p>

        <h2>9. Contact Us</h2>
        <p>
          If you have questions about this Privacy Policy, please contact us.
        </p>

        <p className="mt-8">Last updated: {new Date().toLocaleDateString()}</p>

        <p>
          <Link href="/terms" className="text-rose-600 hover:underline">
            View our Terms of Service
          </Link>
        </p>
      </div>
    </div>
  );
}
