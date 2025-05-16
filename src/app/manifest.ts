import type { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'GMC Attendance Viewer',
    short_name: 'GMC Attendance',
    description: 'A Progressive Web App for viewing GMC attendance records',
    start_url: '/',
    display: 'standalone',
    background_color: '#f5f5f5',
    theme_color: '#14202e',
    icons: [
      {
        src: '/logo.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/logo.ico',
        sizes: '48x48',
        type: 'image/x-icon',
      },
    ],
    screenshots: [
      {
        src: '/screenshot1.png',
        sizes: '512x512',
        type: 'image/png',
        label: 'Login Screen',
      },
      {
        src: '/screenshot2.png',
        sizes: '512x512',
        type: 'image/png',
        label: 'Attendance Records',
      },
      {
        src: '/screenshot3.png',
        sizes: '512x512',
        type: 'image/png',
        label: 'Quarterly Attendance',
      },
    ],
  }
}