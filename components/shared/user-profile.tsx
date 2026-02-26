"use client"

import Image from "next/image"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

const avatarVariants = {
  default: "size-28 border-4",
  small: "size-8 border-none",
}

interface ProfileAvatarProps {
  initials: string
  avatarUrl?: string
  variant?: keyof typeof avatarVariants
  children?: React.ReactNode
}

export function ProfileAvatar({ initials, avatarUrl, variant = "default", children }: ProfileAvatarProps) {
  const choosedVariant = avatarVariants[variant as keyof typeof avatarVariants] || avatarVariants.default

  return (
    <Avatar className={cn("group relative border-card", choosedVariant)}>
      <AvatarImage src={avatarUrl} asChild>
        <Image width={100} height={100} src={avatarUrl!} alt={`Profile image of ${initials}`} />
      </AvatarImage>
      <AvatarFallback className="bg-primary/20 text-xl font-semibold text-primary">{initials}</AvatarFallback>
      {children}
    </Avatar>
  )
}

interface ProfileBannerProps {
  editMode?: boolean
  username?: string | null
  bannerUrl?: string | null
  children?: React.ReactNode
}

export function ProfileBanner({ bannerUrl, children }: ProfileBannerProps) {
  return (
    <div className="group relative h-40 rounded-t-2xl overflow-hidden">
      {bannerUrl ? (
        <Image loading="eager" width={900} height={200} src={bannerUrl} alt="Banner image" className="h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-gradient-to-r from-primary/20 via-[hsl(var(--chart-2))]/20 to-primary/10" />
      )}
      {children}
    </div>
  )
}
