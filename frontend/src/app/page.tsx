export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Smart Ticket System
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Welcome to your ticket management dashboard
        </p>
        <div className="space-y-4">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors">
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}
