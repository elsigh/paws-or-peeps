import FileUpload from "@/components/file-upload";
import { CatLogo } from "@/components/cat-logo";
import { PawPrint } from "@/components/paw-print";
import { RandomCat } from "@/components/random-cat";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ImageIcon } from "lucide-react";
import { DatabaseStatus } from "@/components/database-status";

export default function Home() {
  return (
    <div className="container relative mx-auto px-4 py-12">
      <div className="test-tailwind">
        This text should be red and bold if Tailwind is working
      </div>
      {/* Decorative paw prints */}
      <div className="pointer-events-none absolute left-4 top-20 opacity-20">
        <PawPrint size="lg" rotation={-15} />
      </div>
      <div className="pointer-events-none absolute right-10 top-40 opacity-20">
        <PawPrint size="md" rotation={20} />
      </div>
      <div className="pointer-events-none absolute bottom-20 left-1/4 opacity-20">
        <PawPrint size="lg" rotation={45} />
      </div>
      <div className="pointer-events-none absolute bottom-40 right-1/4 opacity-20">
        <PawPrint size="md" rotation={-30} />
      </div>

      {/* Random cat images */}
      <div className="pointer-events-none absolute left-8 top-32 opacity-80 hidden md:block">
        <RandomCat size="tiny" index={0} rotate={-10} />
      </div>
      <div className="pointer-events-none absolute right-12 bottom-40 opacity-80 hidden md:block">
        <RandomCat size="tiny" index={1} rotate={15} />
      </div>
      <div className="pointer-events-none absolute left-1/3 bottom-20 opacity-80 hidden md:block">
        <RandomCat size="tiny" index={2} rotate={-5} />
      </div>

      <div className="text-center mb-8">
        <div className="flex justify-center mb-4 relative">
          <CatLogo size="lg" />
          {/* Tiny cat peeking from behind the logo */}
          <div className="absolute -right-10 top-1/2 transform -translate-y-1/2">
            <RandomCat size="tiny" index={2} className="opacity-90" />
          </div>
        </div>
        <p className="text-xl text-gray-600">
          Upload a photo of a pet or human and see the magical transformation!
        </p>

        {/* Database status component */}
        <div className="max-w-md mx-auto mt-4">
          <DatabaseStatus />
        </div>

        {/* Gallery link */}
        <div className="mt-4">
          <Link href="/gallery">
            <Button variant="outline" className="gap-2 border-rose-200">
              <ImageIcon className="h-4 w-4" />
              View Transformation Gallery
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-md mx-auto">
        <FileUpload />
      </div>

      <div className="mt-12 max-w-lg mx-auto relative">
        <div className="absolute -left-12 top-1/2 -translate-y-1/2 opacity-20">
          <PawPrint size="md" rotation={-15} />
        </div>
        <div className="absolute -right-12 top-1/2 -translate-y-1/2 opacity-20">
          <PawPrint size="md" rotation={15} />
        </div>

        <h2 className="text-xl font-semibold text-center mb-4 relative">
          <span className="relative">
            How It Works
            <span className="absolute -right-6 -top-4 text-2xl">😺</span>
          </span>
        </h2>
        <ol className="list-decimal pl-6 space-y-2">
          <li>
            Upload an image by clicking, dragging & dropping, or pasting from
            clipboard
          </li>
          <li>Our AI detects if it's a pet or human</li>
          <li>We transform it into an animated version</li>
          <li>Then we create its opposite (pet to human or human to pet)</li>
          <li>Vote on which one you think is the original!</li>
        </ol>
      </div>

      <div className="mt-8 text-center text-sm text-gray-500">
        <p>
          🐾 Paws or Peeps 💁 uses AI to detect pets and humans in your photos
          and transform them into their opposite.
        </p>
      </div>
    </div>
  );
}
