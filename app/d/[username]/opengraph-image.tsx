import { ImageResponse } from "next/og"
import { getProfileByUsername } from "@/lib/actions"
import { getWalletShort } from "@/lib/utils"

// Image metadata
export const contentType = "image/png"
export const size = {
  width: 1200,
  height: 630,
}

type Props = {
  params: Promise<{ username: string }>
}

// Image generation
export default async function Image({ params }: Props) {
  const { username } = await params
  const profile = await getProfileByUsername(username)

  return new ImageResponse(
    // ImageResponse JSX element
    <div
      tw="flex items-center justify-center w-full h-full"
      style={{
        backgroundImage: "linear-gradient(to bottom, #15C19F88 0%, white 80%)",
      }}
    >
      <div tw="relative flex flex-col w-[95%] h-[90%] rounded-2xl border-2 border-neutral-300 bg-white shadow-xl overflow-hidden">
        <div tw="flex h-60 overflow-hidden">
          <img src={profile?.banner_url!} alt={`Banner image of ${profile?.display_name}`} />
        </div>
        <div tw="flex px-10">
          <div tw="flex -mt-28 w-52 h-52 border-8 border-white rounded-full overflow-hidden">
            <img
              width={200}
              height={200}
              src={profile?.avatar_url!}
              alt={`Profile image of ${profile?.display_name}`}
              style={{ objectFit: "cover", aspectRatio: "1 / 1" }}
            />
          </div>
          <div tw="flex flex-col ml-16 pt-6">
            <h1 tw="m-0 text-4xl font-bold tracking-tight">{profile?.display_name}</h1>
            <p tw="m-0 mt-1 text-lg font-mono text-[#15C19F]">@{profile?.username}</p>
            <p tw="m-0 mt-4 text-lg text-neutral-500">{profile?.bio}</p>

            <div tw="flex flex-wrap items-center mt-8">
              <div tw="flex items-center rounded-full border border-neutral-300/80 bg-neutral-200/30 mr-2 px-3 py-1.5 text-neutral-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                  <path d="M9 18c-4.51 2-5-2-7-2" />
                </svg>
                <span tw="ml-1.5">{profile?.github}</span>
              </div>
              <div tw="flex items-center rounded-full border border-neutral-300/80 bg-neutral-200/30 mr-2 px-3 py-1.5 text-neutral-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                </svg>
                <span tw="ml-1.5">{profile?.twitter}</span>
              </div>
              <div tw="flex items-center rounded-full border border-neutral-300/80 bg-neutral-200/30 px-3 py-1.5 text-neutral-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                  <path d="M2 12h20" />
                </svg>
                <span tw="ml-1.5">{profile?.website}</span>
              </div>
            </div>
          </div>
        </div>
        <div tw="flex flex-col absolute bottom-8 left-10">
          <div tw="flex items-center text-neutral-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#15C19F"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
              <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
            </svg>
            <span tw="font-mono ml-2 text-2xl tracking-wider">{getWalletShort(profile?.wallet_address)}</span>
          </div>
        </div>
      </div>
    </div>,
  )
}
