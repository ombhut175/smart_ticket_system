import { Badge } from "@/components/ui/badge"
import { Circle, Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react"

interface StatusBadgeProps {
  status: string
  variant?: "ticket" | "user" | "priority"
}

export function StatusBadge({ status, variant = "ticket" }: StatusBadgeProps) {
  const getTicketStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
        return { color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400", icon: Circle }
      case "in progress":
        return { color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400", icon: Clock }
      case "resolved":
        return { color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400", icon: CheckCircle }
      case "closed":
        return { color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300", icon: XCircle }
      default:
        return { color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300", icon: Circle }
    }
  }

  const getUserStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return { color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400", icon: CheckCircle }
      case "inactive":
        return { color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400", icon: XCircle }
      case "pending":
        return { color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400", icon: Clock }
      default:
        return { color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300", icon: Circle }
    }
  }

  const getPriorityConfig = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return { color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400", icon: AlertTriangle }
      case "medium":
        return { color: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400", icon: Circle }
      case "low":
        return { color: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400", icon: Circle }
      default:
        return { color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300", icon: Circle }
    }
  }

  const getConfig = () => {
    switch (variant) {
      case "user":
        return getUserStatusConfig(status)
      case "priority":
        return getPriorityConfig(status)
      default:
        return getTicketStatusConfig(status)
    }
  }

  const { color, icon: Icon } = getConfig()

  return (
    <Badge className={`${color} flex items-center gap-1 font-medium`}>
      <Icon className="h-3 w-3" />
      {status}
    </Badge>
  )
}
