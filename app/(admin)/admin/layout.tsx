import { redirect } from 'next/navigation'
import { getSession, isAdminRole } from '@/lib/auth'
import SidebarAdmin from '@/components/layout/SidebarAdmin'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()

  if (!session) redirect('/login')

  if (!isAdminRole(session.role)) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-gray-50">
      <SidebarAdmin />
      <main className="lg:pl-64 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pt-16 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  )
}