import Image from "next/image"
import { cn } from "@/lib/utils"

interface EduNexusLogoProps {
  size?: number
  className?: string
}

export function EduNexusLogo({ size = 32, className }: EduNexusLogoProps) {
  return (
    <Image
      src="/images/logo.png"
      alt="EduNexus"
      width={size}
      height={size}
      className={cn("shrink-0 object-contain", className)}
    />
  )
}
