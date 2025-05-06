import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t py-6 md:py-8">
      <div className="flex flex-col items-center justify-center gap-4 md:gap-6">
        <div className="flex md:flex-row gap-2 md:gap-4 text-sm text-foreground">
          <Link href="/about" className="hover:text-rose-500">
            About
          </Link>
          <Link href="/terms" className="hover:text-rose-500">
            Terms of Service
          </Link>
          <Link href="/privacy" className="hover:text-rose-500">
            Privacy Policy
          </Link>
          <a
            href="https://github.com/yourusername/pawsorpeeps"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-rose-500"
          >
            GitHub
          </a>
        </div>
        <div className="text-center text-sm text-foreground">
          © {new Date().getFullYear()} PawsOrPeeps. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
