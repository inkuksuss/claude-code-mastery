import { Menu } from 'lucide-react';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <Link href="/" className="font-bold text-lg">
              Next.js Starter
            </Link>
          </div>
          <nav className="hidden md:flex gap-8">
            <Link href="/" className="text-gray-700 hover:text-gray-900">
              Home
            </Link>
            <Link href="#components" className="text-gray-700 hover:text-gray-900">
              Components
            </Link>
          </nav>
          <button className="md:hidden p-2">
            <Menu size={24} />
          </button>
        </div>
      </div>
    </header>
  );
}
