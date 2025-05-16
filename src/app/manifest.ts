import type { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'GMC Attendanc Viewer',
    short_name: 'GMC Attendance',
    description: 'A Progressive Web App for viewing GMC attendance records',
    start_url: '/',
    display: 'standalone',
    background_color: '#f5f5f5',
    theme_color: '#1976d2',
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
  }
}