"use client"

import Image from "next/image"
import { useState, useTransition } from "react"
import { Camera } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { uploadFile } from "@/lib/actions"
import { cn } from "@/lib/utils"

interface AvatarProfileProps {
  initials: string
  avatarUrl?: string
  editMode?: boolean
  variant?: keyof typeof variants
}

const variants = {
  default: "size-28 border-4",
  small: "size-8 border-none",
}

export function AvatarProfile({ initials, avatarUrl, editMode = false, variant = "default" }: AvatarProfileProps) {
  const [localAvatarUrl, setLocalAvatarUrl] = useState<string | undefined>(avatarUrl)
  const choosedVariant = variants[variant as keyof typeof variants] || variants.default

  return (
    <Avatar className={cn("group relative border-card", choosedVariant)}>
      {editMode && <FileInput onUpload={(url) => setLocalAvatarUrl(url)} />}
      <AvatarImage src={localAvatarUrl} asChild>
        <Image width={100} height={100} src={localAvatarUrl!} alt={`Profile image of ${initials}`} />
      </AvatarImage>
      <AvatarFallback className="bg-primary/20 text-xl font-semibold text-primary">{initials}</AvatarFallback>
    </Avatar>
  )
}

interface BannerImageProps {
  editMode?: boolean
  bannerUrl?: string | null
  children?: React.ReactNode
}

export function BannerImage({ editMode = false, bannerUrl, children }: BannerImageProps) {
  const [localBannerUrl, setLocalBannerUrl] = useState<string>(bannerUrl ?? "")

  return (
    <div className="group relative h-40 rounded-t-2xl overflow-hidden">
      {editMode && <FileInput onUpload={(url) => setLocalBannerUrl(url)} />}
      {localBannerUrl ? (
        <Image loading="eager" width={900} height={200} src={localBannerUrl} alt="Banner image" className="h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-gradient-to-r from-primary/20 via-[hsl(var(--chart-2))]/20 to-primary/10" />
      )}
      {children}
    </div>
  )
}

function FileInput({ onUpload }: { onUpload: (url: string) => void }) {
  const [isPending, startTransition] = useTransition()

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      startTransition(async () => {
        const result = await uploadFile(file)
        if (result.error) console.error(result.error)
        else onUpload(result.url)
      })
    }
  }

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center size-10 bg-muted/80 opacity-0 group-hover:opacity-100 transition-opacity rounded-full overflow-hidden backdrop-blur">
      <input
        type="file"
        multiple={false}
        accept="image/png, image/jpeg, image/jpg"
        className="w-10 h-10 opacity-0 z-10 cursor-pointer file:cursor-pointer"
        disabled={isPending}
        onChange={handleFileChange}
      />
      <Camera className="absolute text-foreground/80" />
    </div>
  )
}
