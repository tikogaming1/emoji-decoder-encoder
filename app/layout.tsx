import type { Metadata } from 'next'
import { MatrixFavicon } from '@/components/matrix-favicon'
import './globals.css'

const siteUrl = 'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'NP_EMOJI_CRYPT // AES-256-GCM',
    template: '%s | NP_EMOJI_CRYPT',
  },
  description:
    'Verstecke geheime Texte im Matrix-Code: AES-256-GCM verschlüsselt, unsichtbar in Emojis – unknackbar für KI & Interception. Zero-Knowledge, PBKDF2 250k, Zero-Width Steganographie (WhatsApp-sicher).',
  keywords: [
    'emoji encoder',
    'emoji decoder',
    'steganographie',
    'AES-256-GCM',
    'verschlüsselung',
    'matrix',
    'zero knowledge',
    'PBKDF2',
    'variation selectors',
    'geheime nachricht emoji',
  ],
  authors: [{ name: 'timonkottig-9457' }],
  creator: 'timonkottig-9457',
  alternates: {
    canonical: siteUrl,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'de_DE',
    url: siteUrl,
    title: 'NP_EMOJI_CRYPT // AES-256-GCM',
    description:
      'Verstecke geheime Texte unsichtbar in Emojis — militärische AES-256-GCM Verschlüsselung, PBKDF2 250k, unknackbar für KI.',
    siteName: 'NP_EMOJI_CRYPT',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'EMOJI_CRYPT — Emoji Steganographie mit AES-256-GCM',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NP_EMOJI_CRYPT // AES-256-GCM',
    description: 'Verstecke geheime Texte unsichtbar in Emojis — AES-256-GCM + PBKDF2 250k. Zero-Knowledge.',
    images: ['/og-image.png'],
  },
  // verification: {
  //   google: 'DEIN_GOOGLE_TOKEN_HIER',
  // },
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
        {/* JSON-LD für Google */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'NP_EMOJI_CRYPT',
              url: siteUrl,
              description:
                'Zero-Knowledge Emoji Steganographie mit AES-256-GCM, PBKDF2 250k und Zero-Width (WhatsApp-sicher).',
              applicationCategory: 'SecurityApplication',
              operatingSystem: 'Web',
              offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
            }),
          }}
        />
      </head>
      <body className="bg-[#030a04] text-[#a7ffb0] antialiased min-h-screen selection:bg-[#00ff41]/30 selection:text-[#eaffea] matrix-scrollbar">
        {children}
        <MatrixFavicon />
      </body>
    </html>
  )
}
