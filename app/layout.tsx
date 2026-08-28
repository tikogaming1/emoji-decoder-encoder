import type { Metadata } from 'next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { MatrixFavicon } from '@/components/matrix-favicon'
import './globals.css'

export const metadata: Metadata = {
  title: 'EMOJI_CRYPT // MATRIX EDITION — AES-256-GCM',
  description:
    'Verstecke geheime Texte im Matrix-Code: AES-256-GCM verschlüsselt, unsichtbar in Emojis – unknackbar für KI & Interception.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="de" className="dark">
      <head>
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⬢</text></svg>"
        />
      </head>
      <body className="bg-[#030a04] text-[#a7ffb0] antialiased min-h-screen selection:bg-[#00ff41]/30 selection:text-[#eaffea] matrix-scrollbar">
        {children}
        <SpeedInsights />
        <MatrixFavicon />
      </body>
    </html>
  )
}
