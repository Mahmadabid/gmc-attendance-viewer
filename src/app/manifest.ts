import type { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'GMC Attendance Viewer',
    short_name: 'GMC Attendance',
    description: 'A Progressive Web App for viewing GMC attendance records',
    start_url: '/',
    display: 'standalone',
    background_color: '#f5f5f5',
    theme_color: '#2b4257',
    icons: [
      {
        src: '/logo.png',
        sizes: '500x500',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/logo-144.png',
        sizes: '144x144',
        type: 'image/png',
      },
    ],
    screenshots: [
      {
        src: '/screenshot1.png',
        sizes: '512x512',
        type: 'image/png',
        label: 'Login Screen',
        form_factor: 'wide',
      },
      {
        src: '/screenshot2.png',
        sizes: '512x512',
        type: 'image/png',
        label: 'Settings',
        form_factor: 'wide',
      },
      {
        src: '/screenshot3.png',
        sizes: '1024x768',
        type: 'image/png',
        label: 'Quarterly Attendance',
        form_factor: 'wide',
      },
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
        label: 'Settings',
      },
      {
        src: '/screenshot3.png',
        sizes: '1024x768',
        type: 'image/png',
        label: 'Quarterly Attendance',
      },
    ],
  }
}