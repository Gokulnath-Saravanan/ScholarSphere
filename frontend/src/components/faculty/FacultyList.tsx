import React, { useState } from 'react'
import { useFaculty } from '@/hooks/useFaculty'
import { FacultyCard } from '@/components/cards/FacultyCard'
import { Input } from '@/components/ui/input'

export const FacultyList: React.FC = () => {
  const { faculty, loading, error, searchFaculty } = useFaculty()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<typeof faculty | null>(null)

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (query.trim()) {
      const results = await searchFaculty(query)
      setSearchResults(results)
    } else {
      setSearchResults(null)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3D52A0]"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        An error occurred while loading faculty data.
      </div>
    )
  }

  const displayedFaculty = searchResults || faculty

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Input
          type="text"
          placeholder="Search faculty by name, department, or institution..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full max-w-2xl mx-auto"
        />
      </div>

      {displayedFaculty.length === 0 ? (
        <div className="text-center text-gray-500">
          {searchQuery ? 'No faculty members found matching your search.' : 'No faculty members available.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedFaculty.map((facultyMember) => (
            <FacultyCard key={facultyMember.id} faculty={facultyMember} />
          ))}
        </div>
      )}
    </div>
  )
} 