"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface EnhancedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  success?: string
  icon?: React.ReactNode
  rightIcon?: React.ReactNode
  variant?: "default" | "floating" | "filled"
}

const EnhancedInput = React.forwardRef<HTMLInputElement, EnhancedInputProps>(
  ({ className, type, label, error, success, icon, rightIcon, variant = "default", placeholder, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)
    const [isFocused, setIsFocused] = React.useState(false)
    const [hasValue, setHasValue] = React.useState(false)
    const { onDrag, onDragEnd, onDragEnter, onDragExit, onDragLeave, onDragOver, onDragStart, onDrop, onAnimationStart, onAnimationEnd, onAnimationIteration, onTransitionEnd, ...rest } = props

    const inputRef = React.useRef<HTMLInputElement>(null)

    React.useImperativeHandle(ref, () => inputRef.current!)

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(e.target.value.length > 0)
      props.onChange?.(e)
    }

    const inputType = type === "password" && showPassword ? "text" : type

    const baseClasses = cn(
      "flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background",
      "file:border-0 file:bg-transparent file:text-sm file:font-medium",
      "placeholder:text-muted-foreground",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "transition-all duration-200 ease-out",
      icon && "pl-10",
      (rightIcon || type === "password") && "pr-10",
      error && "border-red-500 focus-visible:ring-red-500",
      success && "border-green-500 focus-visible:ring-green-500",
      variant === "filled" && "bg-gray-50 dark:bg-gray-800 border-transparent",
      className,
    )

    const containerClasses = cn("relative", variant === "floating" && "pt-4")

    const labelClasses = cn(
      "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      variant === "floating" && [
        "absolute left-3 transition-all duration-200 ease-out pointer-events-none",
        "text-muted-foreground",
        (isFocused || hasValue) && "top-1 text-xs text-primary",
        !(isFocused || hasValue) && "top-1/2 -translate-y-1/2",
      ],
      variant !== "floating" && "block mb-2",
      error && "text-red-500",
      success && "text-green-500",
    )

    return (
      <div className="space-y-2">
        {label && variant !== "floating" && <label className={labelClasses}>{label}</label>}

        <div className={containerClasses}>
          {variant === "floating" && label && <label className={labelClasses}>{label}</label>}

          <div className="relative">
            {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</div>}

            <motion.input
              ref={inputRef}
              type={inputType}
              className={baseClasses}
              placeholder={variant === "floating" ? " " : placeholder}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onChange={handleInputChange}
              whileFocus={{ scale: 1.01 }}
              transition={{ duration: 0.1 }}
              {...rest}
            />

            {type === "password" && (
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            )}

            {rightIcon && type !== "password" && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">{rightIcon}</div>
            )}

            {error && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
                <AlertCircle className="h-4 w-4" />
              </div>
            )}

            {success && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                <CheckCircle className="h-4 w-4" />
              </div>
            )}
          </div>
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-red-500 flex items-center gap-1"
          >
            <AlertCircle className="h-3 w-3" />
            {error}
          </motion.p>
        )}

        {success && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-green-500 flex items-center gap-1"
          >
            <CheckCircle className="h-3 w-3" />
            {success}
          </motion.p>
        )}
      </div>
    )
  },
)
EnhancedInput.displayName = "EnhancedInput"

export { EnhancedInput }
