import { useTransition } from "react"
import { Camera } from "lucide-react"
import { toast } from "sonner"
import type { UpdateImageResponse } from "@/lib/actions"

interface ImageUploadProps {
  onFileChange: (file: File) => Promise<UpdateImageResponse>
}

const IMAGE_MAX_SIZE = 5 * 1024 * 1024

export function ImageUpload({ onFileChange }: ImageUploadProps) {
  const [isPending, startTransition] = useTransition()

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file)
      startTransition(async () => {
        if (file.size > IMAGE_MAX_SIZE) {
          toast.error("File size must be less than 5MB")
          return
        }
        const response = await onFileChange(file)
        if (response.error) {
          toast.error(response.error)
        } else {
          toast.success("Image uploaded successfully")
        }
      })
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
