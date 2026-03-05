import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { isAdminRole } from '@/lib/auth'
import SidebarWarga from '@/components/layout/SidebarWarga'

export default async function WargaLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()

  // Tidak ada sesi → ke login
  if (!session) {
    redirect('/login')
  }

  // Role admin → ke dashboard admin
  if (isAdminRole(session.role)) {
    redirect('/admin/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <SidebarWarga userName={session.nama} />

      {/* Main Content */}
      <main className="lg:pl-64 min-h-screen">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pt-16 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  )
}