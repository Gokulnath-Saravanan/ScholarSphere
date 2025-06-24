import React from 'react'
import { Image } from '@/components/ui/Image'
import { Link } from '@/components/ui/Link'
import type { Faculty } from '@/hooks/useFaculty'

interface FacultyCardProps {
  faculty: Faculty
}

export const FacultyCard: React.FC<FacultyCardProps> = ({ faculty }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="p-6">
        <div className="flex items-start space-x-4">
          <div className="relative w-24 h-24 flex-shrink-0">
            <Image
              src={faculty.photo_url || '/images/default-avatar.png'}
              alt={faculty.name}
              fill
              className="rounded-full object-cover"
            />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-[#3D52A0] mb-1">
              <Link href={`/faculty/${faculty.id}`} className="hover:underline">
                {faculty.name}
              </Link>
            </h3>
            <p className="text-[#8697C4] mb-2">{faculty.department}</p>
            <p className="text-[#ADBBDA] text-sm mb-2">
              {faculty.institution}
            </p>
            
            {faculty.expertise && faculty.expertise.length > 0 && (
              <div className="mb-3">
                <div className="flex flex-wrap gap-2">
                  {faculty.expertise.slice(0, 3).map((area, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs rounded-full bg-[#EDE8F5] text-[#3D52A0]"
                    >
                      {area}
                    </span>
                  ))}
                  {faculty.expertise.length > 3 && (
                    <span className="px-2 py-1 text-xs rounded-full bg-[#EDE8F5] text-[#3D52A0]">
                      +{faculty.expertise.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center space-x-4 text-sm text-[#7091E6]">
              <div className="flex items-center">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span>Citations: {faculty.citations || 0}</span>
              </div>
              <div className="flex items-center">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                <span>h-index: {faculty.h_index || 0}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex space-x-4">
            {faculty.google_scholar_url && (
              <a
                href={faculty.google_scholar_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#7091E6] hover:text-[#3D52A0]"
              >
                Google Scholar
              </a>
            )}
            {faculty.orcid_id && (
              <a
                href={`https://orcid.org/${faculty.orcid_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#7091E6] hover:text-[#3D52A0]"
              >
                ORCID
              </a>
            )}
            {faculty.linkedin_url && (
              <a
                href={faculty.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#7091E6] hover:text-[#3D52A0]"
              >
                LinkedIn
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 