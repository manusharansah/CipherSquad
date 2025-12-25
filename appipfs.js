import React, { useState } from 'react';
import { Upload, CheckCircle, XCircle, AlertCircle, Loader2, Shield, Sparkles, Award } from 'lucide-react';

const API_URL = 'http://localhost:3000';

function App() {
  const [activeTab, setActiveTab] = useState('issue');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError(null);
      setResult(null);
    } else {
      setError('Please select a valid PDF file');
      setFile(null);
    }
  };

  const handleIssueCertificate = async () => {
    if (!file) {
      setError('Please select a PDF file');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('certificate', file);

    try {
      const response = await fetch(`${API_URL}/api/issue-certificate`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setResult({ type: 'issue', data });
        setFile(null);
      } else {
        setError(data.message || 'Failed to issue certificate');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCertificate = async () => {
    if (!file) {
      setError('Please select a PDF file');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('certificate', file);

    try {
      const response = await fetch(`${API_URL}/api/verify-certificate`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setResult({ type: 'verify', data: data.data });
        setFile(null);
      } else {
        setError(data.message || 'Failed to verify certificate');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return date.toLocaleDateString('en-US', options);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-700"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center mb-6 gap-3">
            <div className="relative">
              <Shield className="w-16 h-16 text-cyan-400" strokeWidth={1.5} />
              <Sparkles className="w-6 h-6 text-yellow-300 absolute -top-2 -right-2 animate-pulse" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 mb-3 tracking-tight">
            Blockchain Certificate System
          </h1>
          <p className="text-cyan-100 text-lg font-light">
            Secure, Transparent, and Immutable Certificate Verification
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 backdrop-blur-sm bg-white/5 p-2 rounded-2xl border border-white/10">
          <button
            onClick={() => { setActiveTab('issue'); setResult(null); setError(null); setFile(null); }}
            className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${
              activeTab === 'issue'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/50 scale-105'
                : 'text-cyan-100 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Award className="w-5 h-5" />
              Issue Certificate
            </div>
          </button>
          <button
            onClick={() => { setActiveTab('verify'); setResult(null); setError(null); setFile(null); }}
            className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${
              activeTab === 'verify'
                ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/50 scale-105'
                : 'text-cyan-100 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Shield className="w-5 h-5" />
              Verify Certificate
            </div>
          </button>
        </div>

        {/* Main Card */}
        <div className="backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="p-8 md:p-10">
            {/* Issue Certificate */}
            {activeTab === 'issue' && (
              <div>
                <div className="space-y-6">
                  {/* File Upload */}
                  <div>
                    <label className="block text-sm font-semibold text-cyan-100 mb-3">Certificate PDF</label>
                    <input type="file" accept=".pdf" onChange={handleFileChange} className="hidden" id="issue-file-upload"/>
                    <label htmlFor="issue-file-upload" className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-cyan-400/50 rounded-xl cursor-pointer hover:border-cyan-400 hover:bg-white/10 transition-all backdrop-blur-sm bg-white/5 group">
                      <Upload className="w-12 h-12 text-cyan-400 mb-4 group-hover:scale-110 transition-transform" />
                      <span className="text-base text-cyan-100 font-medium">{file ? file.name : 'Click to upload PDF certificate'}</span>
                      <span className="text-sm text-cyan-300/70 mt-2">PDF will be hashed and stored on blockchain</span>
                    </label>
                  </div>

                  <button onClick={handleIssueCertificate} disabled={loading} className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-4 px-6 rounded-xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-cyan-500/50 transition-all">
                    {loading ? <><Loader2 className="w-6 h-6 animate-spin" /> Processing...</> : <><CheckCircle className="w-6 h-6" /> Issue Certificate</>}
                  </button>
                </div>
              </div>
            )}

            {/* Verify Certificate */}
            {activeTab === 'verify' && (
              <div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-purple-100 mb-3">Upload Certificate PDF</label>
                    <input type="file" accept=".pdf" onChange={handleFileChange} className="hidden" id="verify-file-upload"/>
                    <label htmlFor="verify-file-upload" className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-purple-400/50 rounded-xl cursor-pointer hover:border-purple-400 hover:bg-white/10 transition-all backdrop-blur-sm bg-white/5 group">
                      <Upload className="w-12 h-12 text-purple-400 mb-4 group-hover:scale-110 transition-transform" />
                      <span className="text-base text-purple-100 font-medium">{file ? file.name : 'Click to upload certificate PDF'}</span>
                      <span className="text-sm text-purple-300/70 mt-2">Verify authenticity on blockchain</span>
                    </label>
                  </div>
                  <button onClick={handleVerifyCertificate} disabled={loading} className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-4 px-6 rounded-xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-purple-500/50 transition-all">
                    {loading ? <><Loader2 className="w-6 h-6 animate-spin" /> Verifying...</> : <><Shield className="w-6 h-6" /> Verify Certificate</>}
                  </button>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mt-8 p-5 bg-red-500/20 border border-red-400/50 rounded-xl flex items-start gap-4 backdrop-blur-sm animate-pulse">
                <XCircle className="w-6 h-6 text-red-300 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-red-200 text-lg">Error</h3>
                  <p className="text-sm text-red-300 mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* Result - Issue */}
            {result && result.type === 'issue' && (
              <div className="mt-8 p-6 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-400/50 rounded-xl backdrop-blur-sm">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-green-100 text-xl">Certificate Issued Successfully!</h3>
                    <p className="text-green-200 text-sm mt-1">Permanently stored on blockchain</p>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm p-5 rounded-xl space-y-4 border border-white/20">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <span className="text-cyan-200 font-semibold">Certificate Hash:</span>
                    <span className="md:col-span-2 text-white font-mono text-xs break-all bg-black/20 px-3 py-2 rounded">
                      {result.data.data?.certificateHash || result.data.certificateHash}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <span className="text-cyan-200 font-semibold">Issuer Address:</span>
                    <span className="md:col-span-2 text-white font-mono text-xs break-all bg-black/20 px-3 py-2 rounded">
                      {result.data.data?.issuer || result.data.issuer}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <span className="text-cyan-200 font-semibold">Transaction Hash:</span>
                    <span className="md:col-span-2 text-white font-mono text-xs break-all bg-black/20 px-3 py-2 rounded">
                      {result.data.data?.transactionHash || result.data.transactionHash}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <span className="text-cyan-200 font-semibold">Block Number:</span>
                    <span className="md:col-span-2 text-white bg-black/20 px-3 py-2 rounded">
                      {result.data.data?.blockNumber || result.data.blockNumber}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Result - Verify */}
            {result && result.type === 'verify' && (
              <div className={`mt-8 p-6 border rounded-xl backdrop-blur-sm ${
                result.data.isValid 
                  ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-400/50' 
                  : 'bg-gradient-to-br from-red-500/20 to-orange-500/20 border-red-400/50'
              }`}>
                <div className="flex items-start gap-4 mb-6">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                    result.data.isValid ? 'bg-green-500' : 'bg-red-500'
                  }`}>
                    {result.data.isValid ? <CheckCircle className="w-7 h-7 text-white" /> : <XCircle className="w-7 h-7 text-white" />}
                  </div>
                  <div>
                    <h3 className={`font-bold text-xl ${result.data.isValid ? 'text-green-100' : 'text-red-100'}`}>
                      {result.data.isValid ? '✓ Valid Certificate' : '✗ Invalid Certificate'}
                    </h3>
                    <p className={`text-sm mt-1 ${result.data.isValid ? 'text-green-200' : 'text-red-200'}`}>
                      {result.data.isValid ? 'This certificate is verified on the blockchain' : 'This certificate was not found on the blockchain or has been revoked'}
                    </p>
                  </div>
                </div>
                {result.data.isValid && (
                  <div className="bg-white/10 backdrop-blur-sm p-5 rounded-xl space-y-4 border border-white/20">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                      <span className="text-cyan-200 font-semibold">Certificate Hash:</span>
                      <span className="md:col-span-2 text-white font-mono text-xs break-all bg-black/20 px-3 py-2 rounded">
                        {result.data.certificateHash}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                      <span className="text-cyan-200 font-semibold">Issuer Address:</span>
                      <span className="md:col-span-2 text-white font-mono text-xs break-all bg-black/20 px-3 py-2 rounded">
                        {result.data.issuer}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                      <span className="text-cyan-200 font-semibold">Issued Date:</span>
                      <span className="md:col-span-2 text-white bg-black/20 px-3 py-2 rounded">
                        {formatDate(result.data.issuedDate)}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                      <span className="text-cyan-200 font-semibold">Blockchain Status:</span>
                      <span className="md:col-span-2 text-emerald-300 font-semibold bg-black/20 px-3 py-2 rounded">
                        ✓ Verified on Blockchain
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}

export default App;
