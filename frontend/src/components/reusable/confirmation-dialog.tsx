"use client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AlertTriangle, Trash2, Shield } from "lucide-react"

interface ConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: "destructive" | "warning" | "default"
  onConfirm: () => void
  isLoading?: boolean
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  onConfirm,
  isLoading = false,
}: ConfirmationDialogProps) {
  const getVariantConfig = () => {
    switch (variant) {
      case "destructive":
        return {
          icon: Trash2,
          iconColor: "text-red-600 dark:text-red-400",
          iconBg: "bg-red-100 dark:bg-red-900/20",
          buttonClass: "bg-red-600 hover:bg-red-700 text-white",
        }
      case "warning":
        return {
          icon: AlertTriangle,
          iconColor: "text-orange-600 dark:text-orange-400",
          iconBg: "bg-orange-100 dark:bg-orange-900/20",
          buttonClass: "bg-orange-600 hover:bg-orange-700 text-white",
        }
      default:
        return {
          icon: Shield,
          iconColor: "text-blue-600 dark:text-blue-400",
          iconBg: "bg-blue-100 dark:bg-blue-900/20",
          buttonClass: "bg-blue-600 hover:bg-blue-700 text-white",
        }
    }
  }

  const config = getVariantConfig()
  const IconComponent = config.icon

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-4 mb-4">
            <div className={`rounded-full p-3 ${config.iconBg}`}>
              <IconComponent className={`h-6 w-6 ${config.iconColor}`} />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-left">{title}</DialogTitle>
            </div>
          </div>
          <DialogDescription className="text-left">{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {cancelText}
          </Button>
          <Button onClick={onConfirm} disabled={isLoading} className={`w-full sm:w-auto ${config.buttonClass}`}>
            {isLoading ? "Processing..." : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
