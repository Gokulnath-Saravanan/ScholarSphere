import React, { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'

export const SupabaseTest: React.FC = () => {
  const [status, setStatus] = useState<{
    loading: boolean
    error: string | null
    data: any | null
  }>({
    loading: true,
    error: null,
    data: null,
  })

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Test 1: Basic connection
        console.log('Testing Supabase connection...')
        const { data: testData, error: testError } = await supabase
          .from('faculty')
          .select('count')
          .single()

        if (testError) {
          throw new Error(`Connection test failed: ${testError.message}`)
        }

        // Test 2: Fetch actual data
        console.log('Fetching faculty data...')
        const { data, error } = await supabase
          .from('faculty')
          .select('*')
          .limit(1)

        if (error) {
          throw new Error(`Data fetch failed: ${error.message}`)
        }

        setStatus({
          loading: false,
          error: null,
          data: {
            connectionTest: 'Success',
            facultyCount: testData?.count,
            sampleData: data
          }
        })
      } catch (err) {
        setStatus({
          loading: false,
          error: err instanceof Error ? err.message : 'An unknown error occurred',
          data: null
        })
      }
    }

    testConnection()
  }, [])

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-[#3D52A0] mb-4">Supabase Connection Test</h2>
      
      {status.loading ? (
        <div className="flex items-center space-x-2 text-[#7091E6]">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-t-transparent border-[#7091E6]"></div>
          <span>Testing connection...</span>
        </div>
      ) : status.error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium mb-2">Connection Error</h3>
          <p className="text-red-600">{status.error}</p>
          <div className="mt-4 p-2 bg-red-100 rounded text-red-700">
            <p className="font-medium">Troubleshooting steps:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Check if .env.local file exists with correct Supabase credentials</li>
              <li>Verify NEXT_PUBLIC_SUPABASE_URL is correct</li>
              <li>Verify NEXT_PUBLIC_SUPABASE_ANON_KEY is correct</li>
              <li>Check if the database tables exist</li>
              <li>Verify network connectivity to Supabase</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-[#EDE8F5] rounded-lg p-4">
            <h3 className="text-[#3D52A0] font-medium mb-2">Connection Status</h3>
            <p className="text-[#7091E6]">✓ Connected successfully</p>
            <p className="text-[#8697C4] mt-1">
              Found {status.data.facultyCount || 0} faculty records
            </p>
          </div>

          {status.data.sampleData && status.data.sampleData.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-[#3D52A0] font-medium mb-2">Sample Data</h3>
              <pre className="bg-[#EDE8F5] p-4 rounded-lg overflow-auto max-h-60 text-sm">
                {JSON.stringify(status.data.sampleData[0], null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 