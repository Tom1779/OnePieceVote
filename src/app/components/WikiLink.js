// components/WikiLink.js
export default function WikiLink({ url, className = "" }) {
  if (!url) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`text-xs sm:text-sm text-blue-400 hover:text-blue-300 hover:underline transition-colors cursor-pointer inline-flex items-center gap-1 ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      Wiki
      <svg
        className="w-3 h-3"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
        />
      </svg>
    </a>
  );
}
