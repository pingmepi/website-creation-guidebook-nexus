import { cva } from "class-variance-authority"

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-none text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-zinc-950 text-white hover:bg-vibrant-green hover:text-zinc-950 hover:shadow-hard",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:shadow-hard",
        outline:
          "border-2 border-zinc-950 bg-white hover:bg-vibrant-orange hover:shadow-hard hover:border-zinc-950",
        secondary:
          "bg-zinc-100 text-zinc-900 border-2 border-transparent hover:bg-zinc-200 hover:shadow-hard",
        ghost: "hover:bg-vibrant-green hover:text-zinc-950 hover:shadow-hard-sm",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 px-4",
        lg: "h-12 px-8 text-base",
        icon: "h-11 w-11",
      },
    },

    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
