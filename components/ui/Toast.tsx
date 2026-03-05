'use client'

import { Toaster, toast as hotToast } from 'react-hot-toast'

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      gutter={8}
      toastOptions={{
        duration: 3500,
        style: {
          borderRadius: '12px',
          fontSize: '14px',
          padding: '12px 16px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        },
        success: {
          style: { background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' },
          iconTheme: { primary: '#16a34a', secondary: '#f0fdf4' },
        },
        error: {
          style: { background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' },
          iconTheme: { primary: '#dc2626', secondary: '#fef2f2' },
        },
      }}
    />
  )
}

export const toast = {
  success: (msg: string) => hotToast.success(msg),
  error: (msg: string) => hotToast.error(msg),
  loading: (msg: string) => hotToast.loading(msg),
  dismiss: (id?: string) => hotToast.dismiss(id),
}