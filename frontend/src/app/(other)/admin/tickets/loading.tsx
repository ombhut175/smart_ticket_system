import { RefreshCw } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20 flex items-center justify-center">
      <div className="text-center">
        <div className="rounded-full bg-purple-100 dark:bg-purple-900/20 p-4 inline-block mb-4">
          <RefreshCw className="w-8 h-8 animate-spin text-purple-600 dark:text-purple-400" />
        </div>
        <p className="text-gray-600 dark:text-gray-400 font-medium">Loading tickets...</p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Please wait while we fetch the data</p>
      </div>
    </div>
  )
}
