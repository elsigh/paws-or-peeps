import React from "react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | Paws or Peeps",
  description: "Terms of Service for Paws or Peeps",
};

export default function TermsPage() {
  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>

      <div className="prose prose-rose max-w-none">
        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing or using Paws or Peeps, you agree to be bound by these
          Terms of Service. If you do not agree to these terms, please do not
          use our service.
        </p>

        <h2>2. User Content</h2>
        <p>When you upload images to Paws or Peeps, you assert that:</p>
        <ul>
          <li>
            You own all rights to the content or have authorization to use and
            share it
          </li>
          <li>
            The content does not infringe upon any third party's intellectual
            property rights
          </li>
          <li>
            The content does not violate any applicable laws or regulations
          </li>
        </ul>
        <p>
          We reserve the right to remove any content that violates these terms,
          infringes on intellectual property rights, or violates privacy laws,
          without prior notice.
        </p>

        <h2>3. Content Moderation</h2>
        <p>
          Paws or Peeps may, but is not obligated to, review content that you
          upload. We may remove or refuse to display content that we reasonably
          believe violates our policies or the law.
        </p>

        <h2>4. Intellectual Property</h2>
        <p>
          You retain ownership rights to content you upload. However, by
          uploading content, you grant Paws or Peeps a worldwide, non-exclusive,
          royalty-free license to use, reproduce, modify, and display the
          content in connection with providing our service.
        </p>

        <h2>5. Prohibited Content</h2>
        <p>You may not upload content that:</p>
        <ul>
          <li>Contains explicit or adult content</li>
          <li>Depicts violence or cruelty</li>
          <li>Promotes discrimination or hate speech</li>
          <li>Infringes on others' privacy or intellectual property rights</li>
          <li>Violates any applicable laws</li>
        </ul>

        <h2>6. Limitation of Liability</h2>
        <p>
          Paws or Peeps is provided "as is" without warranties of any kind. We
          are not liable for any damages arising from your use of our service.
        </p>

        <h2>7. Changes to Terms</h2>
        <p>
          We may modify these terms at any time. Continued use of Paws or Peeps
          after changes constitutes acceptance of the modified terms.
        </p>

        <h2>8. Governing Law</h2>
        <p>
          These terms are governed by the laws of the jurisdiction in which Paws
          or Peeps operates, without regard to its conflict of law provisions.
        </p>

        <p className="mt-8">Last updated: {new Date().toLocaleDateString()}</p>

        <p>For questions about these Terms, please contact us.</p>

        <p>
          <Link href="/privacy" className="text-rose-600 hover:underline">
            View our Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}
