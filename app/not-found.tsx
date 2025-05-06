import { CatLogo } from "@/components/cat-logo";
import { PawPrint } from "@/components/paw-print";
import { RandomCat } from "@/components/random-cat";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container relative mx-auto px-4 py-12">
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
      </div>

      <div className="max-w-md mx-auto text-center">
        <div className="mb-6">
          <div className="text-9xl font-bold text-rose-300">404</div>
          <h1 className="text-3xl font-bold mt-4 mb-2">Page Not Found</h1>
          <p className="text-foreground">
            Oops! The transformation you're looking for seems to have wandered
            off.
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <RandomCat size="medium" index={1} className="animate-bounce" />
        </div>

        <Link href="/">
          <Button className="bg-rose-500 hover:bg-rose-600">
            Return Home & Try Again
          </Button>
        </Link>
      </div>
    </div>
  );
}
