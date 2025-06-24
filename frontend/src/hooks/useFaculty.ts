import { useState, useEffect } from 'react'
import { db } from '@/integrations/supabase/client'
import type { Database } from '@/integrations/supabase/types'

type Faculty = Database['public']['Tables']['faculty']['Row']
type FacultyWithPublications = Faculty & {
  faculty_publications: Array<{
    publications: Database['public']['Tables']['publications']['Row']
  }>
}

export const useFaculty = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [faculty, setFaculty] = useState<Faculty[]>([])

  const fetchFaculty = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('Fetching faculty data...')
      
      const { data, error } = await db.faculty.getAll()
      
      if (error) {
        console.error('Error fetching faculty:', error)
        throw error
      }

      console.log('Faculty data received:', data?.length || 0, 'records')
      setFaculty(data || [])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred while fetching faculty data'
      console.error('useFaculty hook error:', message)
      setError(message)
      setFaculty([])
    } finally {
      setLoading(false)
    }
  }

  const getFacultyById = async (id: string): Promise<FacultyWithPublications | null> => {
    try {
      setError(null)
      console.log('Fetching faculty by ID:', id)
      
      const { data, error } = await db.faculty.getById(id)
      
      if (error) {
        console.error('Error fetching faculty by ID:', error)
        throw error
      }

      if (!data) {
        throw new Error('Faculty member not found')
      }

      console.log('Faculty data received for ID:', id)
      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred while fetching faculty member'
      console.error('useFaculty hook error (getFacultyById):', message)
      setError(message)
      return null
    }
  }

  const searchFaculty = async (query: string): Promise<Faculty[]> => {
    try {
      setError(null)
      console.log('Searching faculty with query:', query)
      
      const { data, error } = await db.faculty.search(query)
      
      if (error) {
        console.error('Error searching faculty:', error)
        throw error
      }

      console.log('Search results:', data?.length || 0, 'records')
      return data || []
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred while searching faculty'
      console.error('useFaculty hook error (searchFaculty):', message)
      setError(message)
      return []
    }
  }

  useEffect(() => {
    console.log('useFaculty hook mounted, fetching initial data...')
    fetchFaculty()
    return () => {
      console.log('useFaculty hook unmounted')
    }
  }, [])

  return {
    faculty,
    loading,
    error,
    getFacultyById,
    searchFaculty,
    refreshFaculty: fetchFaculty
  }
}

export type { Faculty, FacultyWithPublications } 