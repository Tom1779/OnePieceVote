// app/not-found.js
import Link from 'next/link';

export const metadata = {
  title: '404 - Page Not Found | One Piece Character Voting',
  description: 'The page you are looking for does not exist.',
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        {/* Pirate themed 404 */}
        <div className="mb-8">
          <img 
            src="/favicon-blue.svg" 
            alt="Logo" 
            className="w-24 h-24 mx-auto mb-4 opacity-50"
          />
        </div>
        
        <h1 className="text-6xl sm:text-8xl font-bold text-blue-400 mb-4">
          404
        </h1>
        
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
          This Island Doesn't Exist!
        </h2>
        
        <p className="text-gray-400 mb-8 text-base sm:text-lg">
          Looks like you've sailed off the map. The page you're looking for can't be found.
        </p>
        
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium transform hover:scale-105 duration-200"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Return to Voting
        </Link>
      </div>
    </div>
  );
}