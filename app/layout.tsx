import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { ThemeProvider } from "@/providers/theme-provider"
import { UserProvider } from "@/providers/user-provider"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
})
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://trytippa.com"),
  title: "Tippa - Cascading Payments on Stellar",
  description: "Automate the trickle-down of value on the Stellar network. Ensure every contributor in your ecosystem gets funded.",
  alternates: {
    canonical: "/",
  },
  other: {
    llms: "/llms.txt",
    "google-site-verification": "oqpweEUt-mKmcgoG22IETjVemEIQUhR6W7Ishz6lx1I",
    "msvalidate.01": "D09C65C1EBDFDC8FF8190255D2986C16",
  },
}

export const viewport: Viewport = {
  themeColor: "#14b8a6",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <UserProvider>{children}</UserProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
