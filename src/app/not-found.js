// app/not-found.js
export const metadata = {
  title: '404 - Page Not Found | One Piece Character Voting',
  description: 'The page you are looking for does not exist.',
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md text-center">
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
          This Island Does not Exist!
        </h2>
        
        <p className="text-gray-400 mb-8 text-base sm:text-lg">
          Looks like you have sailed off the map. The page you are looking for cannot be found.
        </p>
        
        <a
          href="/"
          className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
        >
          Return to Voting
        </a>
      </div>
    </div>
  );
}