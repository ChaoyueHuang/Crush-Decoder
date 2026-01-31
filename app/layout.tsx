import React from "react"
import type { Metadata } from "next"
import localFont from "next/font/local"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const inter = localFont({
  src: [
    { path: "../public/fonts/Inter-VariableFont_opsz,wght.ttf", weight: "100 900", style: "normal" },
    { path: "../public/fonts/Inter-Italic-VariableFont_opsz,wght.ttf", weight: "100 900", style: "italic" },
  ],
  variable: "--font-inter",
  display: "swap",
})

const orbitron = localFont({
  src: [
    { path: "../public/fonts/Orbitron-VariableFont_wght.ttf", weight: "400 900", style: "normal" },
  ],
  variable: "--font-orbitron",
  display: "swap",
})

export const metadata: Metadata = {
  title: 'Crush Decoder - AI 朋友圈解码器',
  description: '上传朋友圈截图，AI 帮你解读 TA 的内心世界',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${orbitron.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
