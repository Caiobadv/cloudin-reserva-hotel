'use client'

import React, { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export const Header: React.FC = () => {
  const { data: session, status } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const getNavLinks = () => {
    if (!session?.user) return []

    const role = session.user.role || 'client'

    const linksByRole: Record<string, { label: string; href: string }[]> = {
      client: [
        { label: 'Reservar', href: '/booking' },
        { label: 'Minhas Reservas', href: '/reservations' },
      ],
      reception: [
        { label: 'Painel Recepção', href: '/reception' },
      ],
      admin: [
        { label: 'Admin', href: '/admin' },
        { label: 'Reservas', href: '/admin/reservations' },
        { label: 'Usuários', href: '/admin/users' },
      ],
    }

    return linksByRole[role] || []
  }

  const navLinks = getNavLinks()

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <div className="text-2xl font-bold text-black">CloudIn</div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-black hover:text-gray-600 font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Section */}
          <div className="hidden md:flex items-center gap-4">
            {status === 'authenticated' && session?.user && (
              <>
                <span className="text-sm text-gray-700">
                  {session.user.name || session.user.email}
                </span>
                <button
                  onClick={() => signOut()}
                  className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors font-medium text-sm"
                >
                  Sair
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-2 py-2 text-black hover:bg-gray-100 rounded-lg transition-colors font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {status === 'authenticated' && session?.user && (
              <div className="pt-4 border-t border-gray-200 space-y-3">
                <div className="text-sm text-gray-700 px-2">
                  {session.user.name || session.user.email}
                </div>
                <button
                  onClick={() => {
                    signOut()
                    setMobileMenuOpen(false)
                  }}
                  className="w-full px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors font-medium text-sm"
                >
                  Sair
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
