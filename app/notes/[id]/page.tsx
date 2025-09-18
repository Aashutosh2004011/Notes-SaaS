'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function NoteForm() {
  const params = useParams<{ id: string }>()
  const noteId = params?.id
  const router = useRouter()
  console.log("🚀 ~ NoteForm ~ noteId:", noteId)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (noteId) {
      fetchNote(noteId)
    }
  }, [noteId])

  const fetchNote = async (id: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/notes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const note = await response.json()
        setTitle(note.title)
        setContent(note.content)
      } else {
        setError('Failed to fetch note')
      }
    } catch (error) {
      console.log("🚀 ~ fetchNote ~ error:", error)
      setError('An error occurred while fetching the note')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      const url = noteId ? `/api/notes/${noteId}` : '/api/notes'
      const method = noteId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, content }),
      })

      if (response.ok) {
        router.push('/dashboard')
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to save note')
      }
    } catch (error) {
      console.log("🚀 ~ handleSubmit ~ error:", error)
      setError('An error occurred while saving the note')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
              {noteId ? 'Edit Note' : 'Create New Note'}
            </h1>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6 text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="mb-6">
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                  Content
                </label>
                <textarea
                  id="content"
                  required
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-md text-white text-sm disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : noteId ? 'Update Note' : 'Create Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}