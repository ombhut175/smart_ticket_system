"use client"

import * as React from "react"
import { motion, Easing } from "framer-motion"
import { cn } from "@/lib/utils"

interface EnhancedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "glass" | "gradient"
  interactive?: boolean
  loading?: boolean
}

const EnhancedCard = React.forwardRef<HTMLDivElement, EnhancedCardProps>(
  ({ className, variant = "default", interactive = false, loading = false, children, ...props }, ref) => {
    const { onDrag, onDragEnd, onDragEnter, onDragExit, onDragLeave, onDragOver, onDragStart, onDrop, onAnimationStart, onAnimationEnd, onAnimationIteration, onTransitionEnd, ...rest } = props
    const cardVariants = {
      default: "bg-card text-card-foreground border shadow-sm",
      elevated: "bg-card text-card-foreground border shadow-lg hover:shadow-xl",
      glass: "glass text-foreground shadow-lg",
      gradient: "gradient-bg text-white shadow-lg",
    }

    const motionProps = interactive
      ? {
          whileHover: { scale: 1.02, y: -4 },
          whileTap: { scale: 0.98 },
          transition: { duration: 0.2, ease: "easeOut" as Easing },
        }
      : {}

    if (loading) {
      return (
        <div
          ref={ref}
          className={cn("rounded-xl p-6 border", cardVariants[variant], "animate-pulse", className)}
          {...props}
        >
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded loading-shimmer"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 loading-shimmer"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 loading-shimmer"></div>
          </div>
        </div>
      )
    }

    return (
      <motion.div
        ref={ref}
        className={cn(
          "rounded-xl p-6 transition-all duration-300 ease-out",
          cardVariants[variant],
          interactive && "cursor-pointer hover:-translate-y-1",
          className,
        )}
        {...motionProps}
        {...rest}
      >
        {children}
      </motion.div>
    )
  },
)
EnhancedCard.displayName = "EnhancedCard"

const EnhancedCardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 pb-6", className)} {...props} />
  ),
)
EnhancedCardHeader.displayName = "EnhancedCardHeader"

const EnhancedCardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-2xl font-semibold leading-none tracking-tight", className)} {...props} />
  ),
)
EnhancedCardTitle.displayName = "EnhancedCardTitle"

const EnhancedCardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  ),
)
EnhancedCardDescription.displayName = "EnhancedCardDescription"

const EnhancedCardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("pt-0", className)} {...props} />,
)
EnhancedCardContent.displayName = "EnhancedCardContent"

const EnhancedCardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("flex items-center pt-6", className)} {...props} />,
)
EnhancedCardFooter.displayName = "EnhancedCardFooter"

export {
  EnhancedCard,
  EnhancedCardHeader,
  EnhancedCardFooter,
  EnhancedCardTitle,
  EnhancedCardDescription,
  EnhancedCardContent,
}
