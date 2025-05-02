import FileUpload from "@/components/file-upload";
import { PawPrint } from "@/components/paw-print";
import { RandomCat } from "@/components/random-cat";
import { LockIcon } from "lucide-react";
//import { DatabaseStatus } from "@/components/database-status";

export default function Home() {
  return (
    <div className="container relative mx-auto px-4 py-8">
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

      <div className="max-w-md mx-auto">
        <FileUpload />
        <div className="mt-4 p-4 bg-rose-50 rounded-lg text-sm text-rose-700">
          <p className="flex items-center gap-2">
            <LockIcon className="h-4 w-4" />
            Uploads are private by default.
          </p>
        </div>
      </div>

      <div className="mt-12 max-w-lg mx-auto relative">
        <div className="absolute -left-12 top-1/2 -translate-y-1/2 opacity-20">
          <PawPrint size="md" rotation={-15} />
        </div>
        <div className="absolute -right-12 top-1/2 -translate-y-1/2 opacity-20">
          <PawPrint size="md" rotation={15} />
        </div>

        <h2 className="text-xl font-semibold text-center mb-4 relative">
          <span className="relative">How It Works</span>
        </h2>
        <ol className="list-decimal pl-6 space-y-2">
          <li>
            Upload an image by clicking, dragging & dropping, or pasting from
            clipboard
          </li>
          <li>Our AI detects if it's a animal or human</li>
          <li>We stylize</li>
          <li>
            Then we create an opposite (animal to human or human to animal)
          </li>
          <li>Get your pals to vote on which one is the original!</li>
        </ol>
      </div>
    </div>
  );
}
