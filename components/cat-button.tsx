import { forwardRef } from "react"
import { Button, type ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface CatButtonProps extends ButtonProps {}

const CatButton = forwardRef<HTMLButtonElement, CatButtonProps>(({ className, children, ...props }, ref) => {
  return (
    <Button
      ref={ref}
      className={cn(
        "relative overflow-hidden transition-all",
        "before:absolute before:left-1/2 before:-top-3 before:h-3 before:w-3 before:-translate-x-1/2 before:rounded-full before:bg-current before:opacity-0 before:transition-opacity hover:before:opacity-100",
        "after:absolute after:right-1/2 after:-top-3 after:h-3 after:w-3 after:translate-x-1/2 after:rounded-full after:bg-current after:opacity-0 after:transition-opacity hover:after:opacity-100",
        className,
      )}
      {...props}
    >
      {children}
    </Button>
  )
})
CatButton.displayName = "CatButton"

export { CatButton }
