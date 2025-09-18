'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface User {
  id: string
  email: string
  role: string
  tenant: {
    id: string
    slug: string
    name: string
    plan: string
  }
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [notes, setNotes] = useState<any[]>([])
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')

    if (!token || !userData) {
      router.push('/auth/login')
      return
    }

    const userObj = JSON.parse(userData)
    setUser(userObj)
    fetchNotes(token)
  }, [router])

const fetchNotes = async (token: string) => {
    try {
      console.log('🚀 Fetching notes with token:', token ? 'Present' : 'Missing')
      
      const response = await fetch('/api/notes', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      })

      console.log('🚀 Response status:', response.status)
      console.log('🚀 Response ok:', response.ok)

      if (response.ok) {
        const notesData = await response.json()
        console.log('✅ Notes fetched:', notesData.length)
        setNotes(notesData)
      } else {
        const errorData = await response.json()
        console.log('❌ Error response:', errorData)
        
        if (response.status === 401) {
          // Token is invalid, redirect to login
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          router.push('/auth/login')
          return
        }
        
        setError(errorData.error || 'Failed to fetch notes')
      }
    } catch (error) {
      console.log('❌ Fetch error:', error)
      setError('An error occurred while fetching notes')
    }
  }

  const handleUpgrade = async () => {
    if (!user) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/tenants/${user.tenant.slug}/upgrade`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        alert('Upgraded to Pro plan successfully!')
        // Refresh user data
        const userResponse = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (userResponse.ok) {
          const userData = await userResponse.json()
          localStorage.setItem('user', JSON.stringify(userData))
          setUser(userData)
        }
      } else {
        const data = await response.json()
        setError(data.error || 'Upgrade failed')
      }
    } catch (error) {
      setError('An error occurred during upgrade')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/auth/login')
  }

  if (!user) {
    return <div>Loading...</div>
  }

  const isFreePlan = user.tenant.plan === 'FREE'
  const noteLimitReached = isFreePlan && notes.length >= 3

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">
              {user.email} ({user.role}) - {user.tenant.name} ({user.tenant.plan})
            </span>
            <button
              onClick={handleLogout}
              className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Notes</h2>
          <Link
            href="/notes/new"
            className={`bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-md text-white text-sm ${
              noteLimitReached ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={(e) => noteLimitReached && e.preventDefault()}
          >
            Create Note
          </Link>
        </div>

        {noteLimitReached && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Free plan limit reached</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>You've reached the maximum of 3 notes on the Free plan.</p>
                  {user.role === 'ADMIN' && (
                    <button
                      onClick={handleUpgrade}
                      className="mt-2 bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded text-white text-sm"
                    >
                      Upgrade to Pro
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4 text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <div key={note.id} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900">{note.title}</h3>
                <p className="mt-1 text-sm text-gray-500">{note.content}</p>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-xs text-gray-400">
                    Created by {note.author.email} on {new Date(note.createdAt).toLocaleDateString()}
                  </span>
                  <Link
                    href={`/notes/${note.id}`}
                    className="text-indigo-600 hover:text-indigo-900 text-sm"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {notes.length === 0 && (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                vectorEffect="non-scaling-stroke"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No notes</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new note.</p>
          </div>
        )}
      </main>
    </div>
  )
}