import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'

export default function Upload() {
  const [file, setFile] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)
  const navigate = useNavigate()

  const handleFile = (f) => {
    if (!f) return
    if (!f.name.toLowerCase().endsWith('.pdf')) {
      setError('Only PDF files are accepted.')
      return
    }
    setFile(f)
    setError(null)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  const handleSubmit = async () => {
    if (!file) return
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const data = await api.analyzePdf(file)
      setResult(data)
    } catch (e) {
      setError(e.response?.data?.detail || e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          ⬆️ Upload Student Profile
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Upload a PDF resume (LinkedIn export supported). The system will extract, score, and analyze it with Gemini.
        </p>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-12 text-center transition ${
          dragging
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 bg-white hover:border-primary-400'
        }`}
      >
        <div className="text-5xl mb-3">📄</div>
        <div className="text-gray-700 font-medium mb-1">
          Drag &amp; drop PDF here
        </div>
        <div className="text-xs text-gray-500 mb-4">or</div>
        <label className="inline-block px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium cursor-pointer transition">
          Choose File
          <input
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={(e) => handleFile(e.target.files[0])}
          />
        </label>

        {file && (
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm">
            <span>📎</span>
            <span className="font-medium text-gray-700">{file.name}</span>
            <span className="text-gray-400">
              ({(file.size / 1024).toFixed(1)} KB)
            </span>
          </div>
        )}
      </div>

      {/* Submit button */}
      {file && !result && (
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="mt-6 w-full py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition"
        >
          {loading ? '🔄 Analyzing... (this may take 20-30s)' : '🚀 Analyze Profile'}
        </button>
      )}

      {/* Loading state */}
      {loading && (
        <div className="mt-6 p-6 bg-primary-50 border border-primary-100 rounded-lg text-center">
          <div className="text-3xl mb-2 animate-pulse">🤖</div>
          <div className="text-sm text-primary-700">
            Parsing PDF • Extracting skills • Scoring • Calling Gemini...
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          ⚠️ <span className="font-medium">Error:</span> {error}
        </div>
      )}

      {/* Success */}
      {result && (
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-xl">
              ✓
            </div>
            <div>
              <div className="font-semibold text-gray-900">
                Analysis Complete!
              </div>
              <div className="text-sm text-gray-500">
                {result.profile?.name} — {result.readiness?.total} / 100 ({result.readiness?.level})
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate('/')}
              className="flex-1 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition"
            >
              📊 View Dashboard
            </button>
            <button
              onClick={() => {
                setFile(null)
                setResult(null)
              }}
              className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition"
            >
              Upload Another
            </button>
          </div>
        </div>
      )}
    </div>
  )
}