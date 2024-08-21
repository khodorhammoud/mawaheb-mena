export default function SocialLinks() {
  return (
    <div className="mt-6 grid grid-cols-1 gap-3">
      <div>
        <a
          href="/"
          className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <span className="sr-only">Continue with Google</span>
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            {/* Google Icon */}
            <path
              d="M12 12h9.5c.3-.7.5-1.5.5-2.5s-.2-1.8-.5-2.5H12V6.4c1.5-.1 3.1-.5 4.4-1.2C15.2 2.6 13.6 2 12 2S8.8 2.6 7.6 3.2c1.3.7 2.9 1.1 4.4 1.2V12z"
              fill="#4285F4"
            />
            <path
              d="M12 2C7.6 2 4 5.6 4 10c0 1.1.2 2.2.6 3.2l3.3-2.5c-.1-.3-.2-.6-.2-1.2s.1-.9.2-1.2l-3.3-2.5C4.2 7.9 4 8.9 4 10c0 4.4 3.6 8 8 8 2.2 0 4.2-.8 5.6-2.4l-3.3-2.5c-.6.5-1.5.9-2.3 1V12z"
              fill="#34A853"
            />
          </svg>
        </a>
      </div>
      <div>
        <a
          href="/"
          className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <span className="sr-only">Continue with LinkedIn</span>
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            {/* LinkedIn Icon */}
            <path
              d="M12 12h9.5c.3-.7.5-1.5.5-2.5s-.2-1.8-.5-2.5H12V6.4c1.5-.1 3.1-.5 4.4-1.2C15.2 2.6 13.6 2 12 2S8.8 2.6 7.6 3.2c1.3.7 2.9 1.1 4.4 1.2V12z"
              fill="#0A66C2"
            />
            <path
              d="M12 2C7.6 2 4 5.6 4 10c0 1.1.2 2.2.6 3.2l3.3-2.5c-.1-.3-.2-.6-.2-1.2s.1-.9.2-1.2l-3.3-2.5C4.2 7.9 4 8.9 4 10c0 4.4 3.6 8 8 8 2.2 0 4.2-.8 5.6-2.4l-3.3-2.5c-.6.5-1.5.9-2.3 1V12z"
              fill="#0A66C2"
            />
          </svg>
        </a>
      </div>
      <div>
        <a
          href="/"
          className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <span className="sr-only">Continue with Microsoft</span>
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            {/* Microsoft Icon */}
            <path
              fill="#F25022"
              d="M12 12h9.5c.3-.7.5-1.5.5-2.5s-.2-1.8-.5-2.5H12V6.4c1.5-.1 3.1-.5 4.4-1.2C15.2 2.6 13.6 2 12 2S8.8 2.6 7.6 3.2c1.3.7 2.9 1.1 4.4 1.2V12z"
            />
            <path
              fill="#7FBA00"
              d="M12 2C7.6 2 4 5.6 4 10c0 1.1.2 2.2.6 3.2l3.3-2.5c-.1-.3-.2-.6-.2-1.2s.1-.9.2-1.2l-3.3-2.5C4.2 7.9 4 8.9 4 10c0 4.4 3.6 8 8 8 2.2 0 4.2-.8 5.6-2.4l-3.3-2.5c-.6.5-1.5.9-2.3 1V12z"
            />
            <path
              fill="#00A4EF"
              d="M12 12h9.5c.3-.7.5-1.5.5-2.5s-.2-1.8-.5-2.5H12V6.4c1.5-.1 3.1-.5 4.4-1.2C15.2 2.6 13.6 2 12 2S8.8 2.6 7.6 3.2c1.3.7 2.9 1.1 4.4 1.2V12z"
            />
            <path
              fill="#FFB900"
              d="M12 2C7.6 2 4 5.6 4 10c0 1.1.2 2.2.6 3.2l3.3-2.5c-.1-.3-.2-.6-.2-1.2s.1-.9.2-1.2l-3.3-2.5C4.2 7.9 4 8.9 4 10c0 4.4 3.6 8 8 8 2.2 0 4.2-.8 5.6-2.4l-3.3-2.5c-.6.5-1.5.9-2.3 1V12z"
            />
          </svg>
        </a>
      </div>
    </div>
  );
}
