// import React, { useState } from 'react';
// import { Upload, CheckCircle, XCircle, FileText, AlertCircle, Loader2, Shield, Award, Sparkles } from 'lucide-react';

// const API_URL = 'http://localhost:3000';

// function App() {
//   const [activeTab, setActiveTab] = useState('issue');
//   const [file, setFile] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [result, setResult] = useState(null);
//   const [error, setError] = useState(null);
  
//   const [certificateId, setCertificateId] = useState('');
//   const [studentName, setStudentName] = useState('');

//   const handleFileChange = (e) => {
//     const selectedFile = e.target.files[0];
//     if (selectedFile && selectedFile.type === 'application/pdf') {
//       setFile(selectedFile);
//       setError(null);
//       setResult(null);
//     } else {
//       setError('Please select a valid PDF file');
//       setFile(null);
//     }
//   };

//   const handleIssueCertificate = async () => {
//     if (!file || !certificateId || !studentName) {
//       setError('Please fill all fields and select a PDF file');
//       return;
//     }

//     setLoading(true);
//     setError(null);
//     setResult(null);

//     const formData = new FormData();
//     formData.append('certificate', file);
//     formData.append('certificateId', certificateId);
//     formData.append('studentName', studentName);

//     try {
//       const response = await fetch(API_URL + '/api/issue-certificate', {
//         method: 'POST',
//         body: formData,
//       });

//       const data = await response.json();

//       if (data.success) {
//         setResult({
//           type: 'issue',
//           data: data.data
//         });
//         setCertificateId('');
//         setStudentName('');
//         setFile(null);
//       } else {
//         setError(data.message || 'Failed to issue certificate');
//       }
//     } catch (err) {
//       setError('Network error: ' + err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleVerifyCertificate = async () => {
//     if (!file) {
//       setError('Please select a PDF file');
//       return;
//     }

//     setLoading(true);
//     setError(null);
//     setResult(null);

//     const formData = new FormData();
//     formData.append('certificate', file);

//     try {
//       const response = await fetch(API_URL + '/api/verify-certificate', {
//         method: 'POST',
//         body: formData,
//       });

//       const data = await response.json();

//       if (data.success) {
//         setResult({
//           type: 'verify',
//           data: data.data
//         });
//       } else {
//         setError(data.message || 'Failed to verify certificate');
//       }
//     } catch (err) {
//       setError('Network error: ' + err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     const options = {
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     };
//     return date.toLocaleDateString('en-US', options);
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 relative overflow-hidden">
//       {/* Animated background elements */}
//       <div className="absolute inset-0 opacity-20">
//         <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
//         <div className="absolute top-40 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-700"></div>
//         <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
//       </div>

//       <div className="container mx-auto px-4 py-8 max-w-5xl relative z-10">
//         {/* Header */}
//         <div className="text-center mb-10">
//           <div className="flex items-center justify-center mb-6 gap-3">
//             <div className="relative">
//               <Shield className="w-16 h-16 text-cyan-400" strokeWidth={1.5} />
//               <Sparkles className="w-6 h-6 text-yellow-300 absolute -top-2 -right-2 animate-pulse" />
//             </div>
//           </div>
//           <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 mb-3 tracking-tight">
//             Blockchain Certificate System
//           </h1>
//           <p className="text-cyan-100 text-lg font-light">
//             Secure, Transparent, and Immutable Certificate Verification
//           </p>
//           <div className="flex items-center justify-center gap-6 mt-6 text-sm text-cyan-200">
//             <div className="flex items-center gap-2">
//               <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
//               <span>Blockchain Secured</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <Award className="w-4 h-4" />
//               <span>Tamper-Proof</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <Shield className="w-4 h-4" />
//               <span>Verified Authenticity</span>
//             </div>
//           </div>
//         </div>

//         {/* Tab Navigation */}
//         <div className="flex gap-4 mb-8 backdrop-blur-sm bg-white/5 p-2 rounded-2xl border border-white/10">
//           <button
//             onClick={() => {
//               setActiveTab('issue');
//               setResult(null);
//               setError(null);
//               setFile(null);
//             }}
//             className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${
//               activeTab === 'issue' 
//                 ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/50 scale-105' 
//                 : 'text-cyan-100 hover:bg-white/10'
//             }`}
//           >
//             <div className="flex items-center justify-center gap-2">
//               <Award className="w-5 h-5" />
//               Issue Certificate
//             </div>
//           </button>
//           <button
//             onClick={() => {
//               setActiveTab('verify');
//               setResult(null);
//               setError(null);
//               setFile(null);
//             }}
//             className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${
//               activeTab === 'verify' 
//                 ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/50 scale-105' 
//                 : 'text-cyan-100 hover:bg-white/10'
//             }`}
//           >
//             <div className="flex items-center justify-center gap-2">
//               <Shield className="w-5 h-5" />
//               Verify Certificate
//             </div>
//           </button>
//         </div>

//         {/* Main Card */}
//         <div className="backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
//           <div className="p-8 md:p-10">
//             {activeTab === 'issue' ? (
//               <div>
//                 <div className="flex items-center gap-3 mb-8">
//                   <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center">
//                     <Award className="w-6 h-6 text-white" />
//                   </div>
//                   <div>
//                     <h2 className="text-3xl font-bold text-white">
//                       Issue New Certificate
//                     </h2>
//                     <p className="text-cyan-200 text-sm">Record certificate permanently on blockchain</p>
//                   </div>
//                 </div>

//                 <div className="space-y-6">
//                   <div>
//                     <label className="block text-sm font-semibold text-cyan-100 mb-3">
//                       Certificate ID
//                     </label>
//                     <input
//                       type="text"
//                       value={certificateId}
//                       onChange={(e) => setCertificateId(e.target.value)}
//                       placeholder="e.g., CERT-2024-001"
//                       className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-white placeholder-cyan-300/50 backdrop-blur-sm transition-all"
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-semibold text-cyan-100 mb-3">
//                       Student Name
//                     </label>
//                     <input
//                       type="text"
//                       value={studentName}
//                       onChange={(e) => setStudentName(e.target.value)}
//                       placeholder="e.g., John Doe"
//                       className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-white placeholder-cyan-300/50 backdrop-blur-sm transition-all"
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-semibold text-cyan-100 mb-3">
//                       Certificate PDF
//                     </label>
//                     <div className="relative">
//                       <input
//                         type="file"
//                         accept=".pdf"
//                         onChange={handleFileChange}
//                         className="hidden"
//                         id="issue-file-upload"
//                       />
//                       <label
//                         htmlFor="issue-file-upload"
//                         className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-cyan-400/50 rounded-xl cursor-pointer hover:border-cyan-400 hover:bg-white/10 transition-all backdrop-blur-sm bg-white/5 group"
//                       >
//                         <Upload className="w-10 h-10 text-cyan-400 mb-3 group-hover:scale-110 transition-transform" />
//                         <span className="text-base text-cyan-100 font-medium">
//                           {file ? file.name : 'Click to upload PDF'}
//                         </span>
//                         <span className="text-xs text-cyan-300/70 mt-2">
//                           Max size: 5MB • Supported format: PDF
//                         </span>
//                       </label>
//                     </div>
//                   </div>

//                   <button
//                     onClick={handleIssueCertificate}
//                     disabled={loading}
//                     className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-cyan-600 hover:to-blue-700 transition-all disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-105 transform"
//                   >
//                     {loading ? (
//                       <>
//                         <Loader2 className="w-6 h-6 animate-spin" />
//                         Processing Transaction...
//                       </>
//                     ) : (
//                       <>
//                         <CheckCircle className="w-6 h-6" />
//                         Issue Certificate on Blockchain
//                       </>
//                     )}
//                   </button>
//                 </div>
//               </div>
//             ) : (
//               <div>
//                 <div className="flex items-center gap-3 mb-8">
//                   <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center">
//                     <Shield className="w-6 h-6 text-white" />
//                   </div>
//                   <div>
//                     <h2 className="text-3xl font-bold text-white">
//                       Verify Certificate
//                     </h2>
//                     <p className="text-purple-200 text-sm">Check certificate authenticity on blockchain</p>
//                   </div>
//                 </div>

//                 <div className="space-y-6">
//                   <div>
//                     <label className="block text-sm font-semibold text-purple-100 mb-3">
//                       Upload Certificate PDF
//                     </label>
//                     <div className="relative">
//                       <input
//                         type="file"
//                         accept=".pdf"
//                         onChange={handleFileChange}
//                         className="hidden"
//                         id="verify-file-upload"
//                       />
//                       <label
//                         htmlFor="verify-file-upload"
//                         className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-purple-400/50 rounded-xl cursor-pointer hover:border-purple-400 hover:bg-white/10 transition-all backdrop-blur-sm bg-white/5 group"
//                       >
//                         <Upload className="w-12 h-12 text-purple-400 mb-4 group-hover:scale-110 transition-transform" />
//                         <span className="text-base text-purple-100 font-medium">
//                           {file ? file.name : 'Click to upload certificate PDF'}
//                         </span>
//                         <span className="text-sm text-purple-300/70 mt-3 max-w-md text-center">
//                           The system will verify this certificate against blockchain records
//                         </span>
//                       </label>
//                     </div>
//                   </div>

//                   <button
//                     onClick={handleVerifyCertificate}
//                     disabled={loading}
//                     className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-purple-600 hover:to-pink-700 transition-all disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105 transform"
//                   >
//                     {loading ? (
//                       <>
//                         <Loader2 className="w-6 h-6 animate-spin" />
//                         Verifying on Blockchain...
//                       </>
//                     ) : (
//                       <>
//                         <Shield className="w-6 h-6" />
//                         Verify Certificate Authenticity
//                       </>
//                     )}
//                   </button>
//                 </div>
//               </div>
//             )}

//             {error && (
//               <div className="mt-8 p-5 bg-red-500/20 border border-red-400/50 rounded-xl flex items-start gap-4 backdrop-blur-sm animate-pulse">
//                 <XCircle className="w-6 h-6 text-red-300 flex-shrink-0 mt-0.5" />
//                 <div>
//                   <h3 className="font-bold text-red-200 text-lg">Error</h3>
//                   <p className="text-sm text-red-300 mt-1">{error}</p>
//                 </div>
//               </div>
//             )}

//             {result && result.type === 'issue' && (
//               <div className="mt-8 p-6 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-400/50 rounded-xl backdrop-blur-sm animate-fadeIn">
//                 <div className="flex items-start gap-4 mb-6">
//                   <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
//                     <CheckCircle className="w-7 h-7 text-white" />
//                   </div>
//                   <div>
//                     <h3 className="font-bold text-green-100 text-xl">
//                       Certificate Issued Successfully!
//                     </h3>
//                     <p className="text-sm text-green-200 mt-1">
//                       The certificate has been permanently recorded on the blockchain
//                     </p>
//                   </div>
//                 </div>
                
//                 <div className="bg-white/10 backdrop-blur-sm p-5 rounded-xl space-y-4 border border-white/20">
//                   <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
//                     <span className="text-cyan-200 font-semibold">Certificate ID:</span>
//                     <span className="md:col-span-2 text-white font-mono bg-black/20 px-3 py-2 rounded">
//                       {result.data.certificateId}
//                     </span>
//                   </div>
//                   <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
//                     <span className="text-cyan-200 font-semibold">Student Name:</span>
//                     <span className="md:col-span-2 text-white bg-black/20 px-3 py-2 rounded">
//                       {result.data.studentName}
//                     </span>
//                   </div>
//                   <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
//                     <span className="text-cyan-200 font-semibold">Certificate Hash:</span>
//                     <span className="md:col-span-2 text-white font-mono text-xs break-all bg-black/20 px-3 py-2 rounded">
//                       {result.data.certificateHash}
//                     </span>
//                   </div>
//                   <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
//                     <span className="text-cyan-200 font-semibold">Block Number:</span>
//                     <span className="md:col-span-2 text-white font-mono bg-black/20 px-3 py-2 rounded">
//                       {result.data.blockNumber}
//                     </span>
//                   </div>
//                   <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
//                     <span className="text-cyan-200 font-semibold">Transaction Hash:</span>
//                     <span className="md:col-span-2 text-white font-mono text-xs break-all bg-black/20 px-3 py-2 rounded">
//                       {result.data.transactionHash}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {result && result.type === 'verify' && (
//               <div className={`mt-8 p-6 border rounded-xl backdrop-blur-sm animate-fadeIn ${
//                 result.data.isValid 
//                   ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-400/50' 
//                   : 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-400/50'
//               }`}>
//                 <div className="flex items-start gap-4 mb-6">
//                   <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
//                     result.data.isValid ? 'bg-green-500' : 'bg-yellow-500'
//                   }`}>
//                     {result.data.isValid ? (
//                       <CheckCircle className="w-7 h-7 text-white" />
//                     ) : (
//                       <AlertCircle className="w-7 h-7 text-white" />
//                     )}
//                   </div>
//                   <div>
//                     <h3 className={`font-bold text-xl ${
//                       result.data.isValid ? 'text-green-100' : 'text-yellow-100'
//                     }`}>
//                       {result.data.isValid ? '✓ Valid Certificate' : '⚠ Certificate Not Found'}
//                     </h3>
//                     <p className={`text-sm mt-1 ${
//                       result.data.isValid ? 'text-green-200' : 'text-yellow-200'
//                     }`}>
//                       {result.data.isValid 
//                         ? 'This certificate is authentic and registered on the blockchain' 
//                         : 'This certificate is not registered in the blockchain system'}
//                     </p>
//                   </div>
//                 </div>
                
//                 {result.data.isValid && (
//                   <div className="bg-white/10 backdrop-blur-sm p-5 rounded-xl space-y-4 border border-white/20">
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
//                       <span className="text-cyan-200 font-semibold">Certificate ID:</span>
//                       <span className="md:col-span-2 text-white font-mono bg-black/20 px-3 py-2 rounded">
//                         {result.data.certificateId}
//                       </span>
//                     </div>
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
//                       <span className="text-cyan-200 font-semibold">Student Name:</span>
//                       <span className="md:col-span-2 text-white bg-black/20 px-3 py-2 rounded">
//                         {result.data.studentName}
//                       </span>
//                     </div>
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
//                       <span className="text-cyan-200 font-semibold">Issued Date:</span>
//                       <span className="md:col-span-2 text-white bg-black/20 px-3 py-2 rounded">
//                         {formatDate(result.data.issuedDate)}
//                       </span>
//                     </div>
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
//                       <span className="text-cyan-200 font-semibold">Certificate Hash:</span>
//                       <span className="md:col-span-2 text-white font-mono text-xs break-all bg-black/20 px-3 py-2 rounded">
//                         {result.data.certificateHash}
//                       </span>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Footer */}
//         <div className="mt-10 text-center">
//           <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
//             <div className="flex items-center gap-2">
//               <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
//               <span className="text-cyan-200 text-sm font-medium">Powered by Blockchain Technology</span>
//             </div>
//             <span className="text-cyan-400">•</span>
//             <span className="text-cyan-300 text-sm">API: {API_URL}</span>
//           </div>
//         </div>
//       </div>

//       <style>{`
//         @keyframes fadeIn {
//           from { opacity: 0; transform: translateY(10px); }
//           to { opacity: 1; transform: translateY(0); }
//         }
//         .animate-fadeIn {
//           animation: fadeIn 0.5s ease-out;
//         }
//       `}</style>
//     </div>
//   );
// }

// export default App;


// import React, { useState } from 'react';
// import { Upload, CheckCircle, XCircle, AlertCircle, Loader2, Shield, Sparkles, Award } from 'lucide-react';

// const API_URL = 'http://localhost:3000';

// function App() {
//   const [activeTab, setActiveTab] = useState('issue');
//   const [file, setFile] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [result, setResult] = useState(null);
//   const [error, setError] = useState(null);

//   const handleFileChange = (e) => {
//     const selectedFile = e.target.files[0];
//     if (selectedFile && selectedFile.type === 'application/pdf') {
//       setFile(selectedFile);
//       setError(null);
//       setResult(null);
//     } else {
//       setError('Please select a valid PDF file');
//       setFile(null);
//     }
//   };

//   const handleIssueCertificate = async () => {
//     if (!file) {
//       setError('Please select a PDF file');
//       return;
//     }

//     setLoading(true);
//     setError(null);
//     setResult(null);

//     const formData = new FormData();
//     formData.append('certificate', file);

//     try {
//       const response = await fetch(`${API_URL}/api/issue-certificate`, {
//         method: 'POST',
//         body: formData,
//       });

//       const data = await response.json();

//       if (data.success) {
//         setResult({ type: 'issue', data });
//         setFile(null);
//       } else {
//         setError(data.message || 'Failed to issue certificate');
//       }
//     } catch (err) {
//       setError('Network error: ' + err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleVerifyCertificate = async () => {
//     if (!file) {
//       setError('Please select a PDF file');
//       return;
//     }

//     setLoading(true);
//     setError(null);
//     setResult(null);

//     const formData = new FormData();
//     formData.append('certificate', file);

//     try {
//       const response = await fetch(`${API_URL}/api/verify-certificate`, {
//         method: 'POST',
//         body: formData,
//       });

//       const data = await response.json();

//       if (data.success) {
//         setResult({ type: 'verify', data });
//         setFile(null);
//       } else {
//         setError(data.message || 'Failed to verify certificate');
//       }
//     } catch (err) {
//       setError('Network error: ' + err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return '-';
//     const date = new Date(dateString);
//     const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
//     return date.toLocaleDateString('en-US', options);
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 relative overflow-hidden">
//       {/* Animated background */}
//       <div className="absolute inset-0 opacity-20">
//         <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
//         <div className="absolute top-40 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-700"></div>
//         <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
//       </div>

//       <div className="container mx-auto px-4 py-8 max-w-5xl relative z-10">
//         {/* Header */}
//         <div className="text-center mb-10">
//           <div className="flex items-center justify-center mb-6 gap-3">
//             <div className="relative">
//               <Shield className="w-16 h-16 text-cyan-400" strokeWidth={1.5} />
//               <Sparkles className="w-6 h-6 text-yellow-300 absolute -top-2 -right-2 animate-pulse" />
//             </div>
//           </div>
//           <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 mb-3 tracking-tight">
//             Blockchain Certificate System
//           </h1>
//           <p className="text-cyan-100 text-lg font-light">
//             Secure, Transparent, and Immutable Certificate Verification
//           </p>
//         </div>

//         {/* Tab Navigation */}
//         <div className="flex gap-4 mb-8 backdrop-blur-sm bg-white/5 p-2 rounded-2xl border border-white/10">
//           <button
//             onClick={() => { setActiveTab('issue'); setResult(null); setError(null); setFile(null); }}
//             className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${
//               activeTab === 'issue'
//                 ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/50 scale-105'
//                 : 'text-cyan-100 hover:bg-white/10'
//             }`}
//           >
//             <div className="flex items-center justify-center gap-2">
//               <Award className="w-5 h-5" />
//               Issue Certificate
//             </div>
//           </button>
//           <button
//             onClick={() => { setActiveTab('verify'); setResult(null); setError(null); setFile(null); }}
//             className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${
//               activeTab === 'verify'
//                 ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/50 scale-105'
//                 : 'text-cyan-100 hover:bg-white/10'
//             }`}
//           >
//             <div className="flex items-center justify-center gap-2">
//               <Shield className="w-5 h-5" />
//               Verify Certificate
//             </div>
//           </button>
//         </div>

//         {/* Main Card */}
//         <div className="backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
//           <div className="p-8 md:p-10">
//             {/* Issue Certificate */}
//             {activeTab === 'issue' && (
//               <div>
//                 <div className="space-y-6">
//                   <div>
//                     <label className="block text-sm font-semibold text-cyan-100 mb-3">Certificate PDF</label>
//                     <input type="file" accept=".pdf" onChange={handleFileChange} className="hidden" id="issue-file-upload"/>
//                     <label htmlFor="issue-file-upload" className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-cyan-400/50 rounded-xl cursor-pointer hover:border-cyan-400 hover:bg-white/10 transition-all backdrop-blur-sm bg-white/5 group">
//                       <Upload className="w-10 h-10 text-cyan-400 mb-3 group-hover:scale-110 transition-transform" />
//                       <span className="text-base text-cyan-100 font-medium">{file ? file.name : 'Click to upload PDF'}</span>
//                     </label>
//                   </div>
//                   <button onClick={handleIssueCertificate} disabled={loading} className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-4 px-6 rounded-xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg">
//                     {loading ? <><Loader2 className="w-6 h-6 animate-spin" /> Processing...</> : <><CheckCircle className="w-6 h-6" /> Issue Certificate</>}
//                   </button>
//                 </div>
//               </div>
//             )}

//             {/* Verify Certificate */}
//             {activeTab === 'verify' && (
//               <div>
//                 <div className="space-y-6">
//                   <div>
//                     <label className="block text-sm font-semibold text-purple-100 mb-3">Upload Certificate PDF</label>
//                     <input type="file" accept=".pdf" onChange={handleFileChange} className="hidden" id="verify-file-upload"/>
//                     <label htmlFor="verify-file-upload" className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-purple-400/50 rounded-xl cursor-pointer hover:border-purple-400 hover:bg-white/10 transition-all backdrop-blur-sm bg-white/5 group">
//                       <Upload className="w-12 h-12 text-purple-400 mb-4 group-hover:scale-110 transition-transform" />
//                       <span className="text-base text-purple-100 font-medium">{file ? file.name : 'Click to upload certificate PDF'}</span>
//                     </label>
//                   </div>
//                   <button onClick={handleVerifyCertificate} disabled={loading} className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-4 px-6 rounded-xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg">
//                     {loading ? <><Loader2 className="w-6 h-6 animate-spin" /> Verifying...</> : <><Shield className="w-6 h-6" /> Verify Certificate</>}
//                   </button>
//                 </div>
//               </div>
//             )}

//             {/* Error */}
//             {error && (
//               <div className="mt-8 p-5 bg-red-500/20 border border-red-400/50 rounded-xl flex items-start gap-4 backdrop-blur-sm animate-pulse">
//                 <XCircle className="w-6 h-6 text-red-300 flex-shrink-0 mt-0.5" />
//                 <div>
//                   <h3 className="font-bold text-red-200 text-lg">Error</h3>
//                   <p className="text-sm text-red-300 mt-1">{error}</p>
//                 </div>
//               </div>
//             )}

//             {/* Result */}
//             {result && result.type === 'issue' && (
//               <div className="mt-8 p-6 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-400/50 rounded-xl backdrop-blur-sm">
//                 <div className="flex items-start gap-4 mb-6">
//                   <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
//                     <CheckCircle className="w-7 h-7 text-white" />
//                   </div>
//                   <div>
//                     <h3 className="font-bold text-green-100 text-xl">Certificate Issued Successfully!</h3>
//                   </div>
//                 </div>
//                 <div className="bg-white/10 backdrop-blur-sm p-5 rounded-xl space-y-4 border border-white/20">
//                   <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
//                     <span className="text-cyan-200 font-semibold">Certificate Hash:</span>
//                     <span className="md:col-span-2 text-white font-mono text-xs break-all bg-black/20 px-3 py-2 rounded">
//                       {result.data.certificateHash}
//                     </span>
//                   </div>
//                   <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
//                     <span className="text-cyan-200 font-semibold">Transaction Hash:</span>
//                     <span className="md:col-span-2 text-white font-mono text-xs break-all bg-black/20 px-3 py-2 rounded">
//                       {result.data.transactionHash}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {result && result.type === 'verify' && (
//               <div className={`mt-8 p-6 border rounded-xl backdrop-blur-sm ${
//                 result.data.valid 
//                   ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-400/50' 
//                   : 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-400/50'
//               }`}>
//                 <div className="flex items-start gap-4 mb-6">
//                   <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
//                     result.data.valid ? 'bg-green-500' : 'bg-yellow-500'
//                   }`}>
//                     {result.data.valid ? <CheckCircle className="w-7 h-7 text-white" /> : <AlertCircle className="w-7 h-7 text-white" />}
//                   </div>
//                   <div>
//                     <h3 className={`font-bold text-xl ${result.data.valid ? 'text-green-100' : 'text-yellow-100'}`}>
//                       {result.data.valid ? '✓ Valid Certificate' : '⚠ Certificate Not Found'}
//                     </h3>
//                   </div>
//                 </div>
//                 {result.data.valid && (
//                   <div className="bg-white/10 backdrop-blur-sm p-5 rounded-xl space-y-4 border border-white/20">
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
//                       <span className="text-cyan-200 font-semibold">Certificate Hash:</span>
//                       <span className="md:col-span-2 text-white font-mono text-xs break-all bg-black/20 px-3 py-2 rounded">{result.data.certificateHash}</span>
//                     </div>
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
//                       <span className="text-cyan-200 font-semibold">Issuer:</span>
//                       <span className="md:col-span-2 text-white bg-black/20 px-3 py-2 rounded">{result.data.issuer}</span>
//                     </div>
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
//                       <span className="text-cyan-200 font-semibold">Issued Date:</span>
//                       <span className="md:col-span-2 text-white bg-black/20 px-3 py-2 rounded">{formatDate(result.data.issuedAt)}</span>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       <style>{`
//         @keyframes fadeIn {
//           from { opacity: 0; transform: translateY(10px); }
//           to { opacity: 1; transform: translateY(0); }
//         }
//         .animate-fadeIn {
//           animation: fadeIn 0.5s ease-out;
//         }
//       `}</style>
//     </div>
//   );
// }

// export default App;



// import React, { useState } from 'react';
// import { Upload, CheckCircle, XCircle, AlertCircle, Loader2, Shield, Sparkles, Award } from 'lucide-react';

// const API_URL = 'http://localhost:3000';

// function App() {
//   const [activeTab, setActiveTab] = useState('issue');
//   const [file, setFile] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [result, setResult] = useState(null);
//   const [error, setError] = useState(null);

//   const handleFileChange = (e) => {
//     const selectedFile = e.target.files[0];
//     if (selectedFile && selectedFile.type === 'application/pdf') {
//       setFile(selectedFile);
//       setError(null);
//       setResult(null);
//     } else {
//       setError('Please select a valid PDF file');
//       setFile(null);
//     }
//   };

//   const handleIssueCertificate = async () => {
//     if (!file) {
//       setError('Please select a PDF file');
//       return;
//     }

//     setLoading(true);
//     setError(null);
//     setResult(null);

//     const formData = new FormData();
//     formData.append('certificate', file);

//     try {
//       const response = await fetch(`${API_URL}/api/issue-certificate`, {
//         method: 'POST',
//         body: formData,
//       });

//       const data = await response.json();

//       if (data.success) {
//         setResult({ type: 'issue', data });
//         setFile(null);
//       } else {
//         setError(data.message || 'Failed to issue certificate');
//       }
//     } catch (err) {
//       setError('Network error: ' + err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleVerifyCertificate = async () => {
//     if (!file) {
//       setError('Please select a PDF file');
//       return;
//     }

//     setLoading(true);
//     setError(null);
//     setResult(null);

//     const formData = new FormData();
//     formData.append('certificate', file);

//     try {
//       const response = await fetch(`${API_URL}/api/verify-certificate`, {
//         method: 'POST',
//         body: formData,
//       });

//       const data = await response.json();

//       if (data.success) {
//         setResult({ type: 'verify', data: data.data });
//         setFile(null);
//       } else {
//         setError(data.message || 'Failed to verify certificate');
//       }
//     } catch (err) {
//       setError('Network error: ' + err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return '-';
//     const date = new Date(dateString);
//     const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
//     return date.toLocaleDateString('en-US', options);
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 relative overflow-hidden">
//       {/* Animated background */}
//       <div className="absolute inset-0 opacity-20">
//         <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
//         <div className="absolute top-40 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-700"></div>
//         <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
//       </div>

//       <div className="container mx-auto px-4 py-8 max-w-5xl relative z-10">
//         {/* Header */}
//         <div className="text-center mb-10">
//           <div className="flex items-center justify-center mb-6 gap-3">
//             <div className="relative">
//               <Shield className="w-16 h-16 text-cyan-400" strokeWidth={1.5} />
//               <Sparkles className="w-6 h-6 text-yellow-300 absolute -top-2 -right-2 animate-pulse" />
//             </div>
//           </div>
//           <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 mb-3 tracking-tight">
//             Blockchain Certificate System
//           </h1>
//           <p className="text-cyan-100 text-lg font-light">
//             Secure, Transparent, and Immutable Certificate Verification
//           </p>
//         </div>

//         {/* Tab Navigation */}
//         <div className="flex gap-4 mb-8 backdrop-blur-sm bg-white/5 p-2 rounded-2xl border border-white/10">
//           <button
//             onClick={() => { setActiveTab('issue'); setResult(null); setError(null); setFile(null); }}
//             className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${
//               activeTab === 'issue'
//                 ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/50 scale-105'
//                 : 'text-cyan-100 hover:bg-white/10'
//             }`}
//           >
//             <div className="flex items-center justify-center gap-2">
//               <Award className="w-5 h-5" />
//               Issue Certificate
//             </div>
//           </button>
//           <button
//             onClick={() => { setActiveTab('verify'); setResult(null); setError(null); setFile(null); }}
//             className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${
//               activeTab === 'verify'
//                 ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/50 scale-105'
//                 : 'text-cyan-100 hover:bg-white/10'
//             }`}
//           >
//             <div className="flex items-center justify-center gap-2">
//               <Shield className="w-5 h-5" />
//               Verify Certificate
//             </div>
//           </button>
//         </div>

//         {/* Main Card */}
//         <div className="backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
//           <div className="p-8 md:p-10">
//             {/* Issue Certificate */}
//             {activeTab === 'issue' && (
//               <div>
//                 <div className="space-y-6">
//                   {/* File Upload */}
//                   <div>
//                     <label className="block text-sm font-semibold text-cyan-100 mb-3">Certificate PDF</label>
//                     <input type="file" accept=".pdf" onChange={handleFileChange} className="hidden" id="issue-file-upload"/>
//                     <label htmlFor="issue-file-upload" className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-cyan-400/50 rounded-xl cursor-pointer hover:border-cyan-400 hover:bg-white/10 transition-all backdrop-blur-sm bg-white/5 group">
//                       <Upload className="w-12 h-12 text-cyan-400 mb-4 group-hover:scale-110 transition-transform" />
//                       <span className="text-base text-cyan-100 font-medium">{file ? file.name : 'Click to upload PDF certificate'}</span>
//                       <span className="text-sm text-cyan-300/70 mt-2">PDF will be hashed and stored on blockchain</span>
//                     </label>
//                   </div>

//                   <button onClick={handleIssueCertificate} disabled={loading} className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-4 px-6 rounded-xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-cyan-500/50 transition-all">
//                     {loading ? <><Loader2 className="w-6 h-6 animate-spin" /> Processing...</> : <><CheckCircle className="w-6 h-6" /> Issue Certificate</>}
//                   </button>
//                 </div>
//               </div>
//             )}

//             {/* Verify Certificate */}
//             {activeTab === 'verify' && (
//               <div>
//                 <div className="space-y-6">
//                   <div>
//                     <label className="block text-sm font-semibold text-purple-100 mb-3">Upload Certificate PDF</label>
//                     <input type="file" accept=".pdf" onChange={handleFileChange} className="hidden" id="verify-file-upload"/>
//                     <label htmlFor="verify-file-upload" className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-purple-400/50 rounded-xl cursor-pointer hover:border-purple-400 hover:bg-white/10 transition-all backdrop-blur-sm bg-white/5 group">
//                       <Upload className="w-12 h-12 text-purple-400 mb-4 group-hover:scale-110 transition-transform" />
//                       <span className="text-base text-purple-100 font-medium">{file ? file.name : 'Click to upload certificate PDF'}</span>
//                       <span className="text-sm text-purple-300/70 mt-2">Verify authenticity on blockchain</span>
//                     </label>
//                   </div>
//                   <button onClick={handleVerifyCertificate} disabled={loading} className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-4 px-6 rounded-xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-purple-500/50 transition-all">
//                     {loading ? <><Loader2 className="w-6 h-6 animate-spin" /> Verifying...</> : <><Shield className="w-6 h-6" /> Verify Certificate</>}
//                   </button>
//                 </div>
//               </div>
//             )}

//             {/* Error */}
//             {error && (
//               <div className="mt-8 p-5 bg-red-500/20 border border-red-400/50 rounded-xl flex items-start gap-4 backdrop-blur-sm animate-pulse">
//                 <XCircle className="w-6 h-6 text-red-300 flex-shrink-0 mt-0.5" />
//                 <div>
//                   <h3 className="font-bold text-red-200 text-lg">Error</h3>
//                   <p className="text-sm text-red-300 mt-1">{error}</p>
//                 </div>
//               </div>
//             )}

//             {/* Result - Issue */}
//             {result && result.type === 'issue' && (
//               <div className="mt-8 p-6 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-400/50 rounded-xl backdrop-blur-sm">
//                 <div className="flex items-start gap-4 mb-6">
//                   <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
//                     <CheckCircle className="w-7 h-7 text-white" />
//                   </div>
//                   <div>
//                     <h3 className="font-bold text-green-100 text-xl">Certificate Issued Successfully!</h3>
//                     <p className="text-green-200 text-sm mt-1">Permanently stored on blockchain</p>
//                   </div>
//                 </div>
//                 <div className="bg-white/10 backdrop-blur-sm p-5 rounded-xl space-y-4 border border-white/20">
//                   <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
//                     <span className="text-cyan-200 font-semibold">Certificate Hash:</span>
//                     <span className="md:col-span-2 text-white font-mono text-xs break-all bg-black/20 px-3 py-2 rounded">
//                       {result.data.data?.certificateHash || result.data.certificateHash}
//                     </span>
//                   </div>
//                   <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
//                     <span className="text-cyan-200 font-semibold">Issuer Address:</span>
//                     <span className="md:col-span-2 text-white font-mono text-xs break-all bg-black/20 px-3 py-2 rounded">
//                       {result.data.data?.issuer || result.data.issuer}
//                     </span>
//                   </div>
//                   <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
//                     <span className="text-cyan-200 font-semibold">Transaction Hash:</span>
//                     <span className="md:col-span-2 text-white font-mono text-xs break-all bg-black/20 px-3 py-2 rounded">
//                       {result.data.data?.transactionHash || result.data.transactionHash}
//                     </span>
//                   </div>
//                   <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
//                     <span className="text-cyan-200 font-semibold">Block Number:</span>
//                     <span className="md:col-span-2 text-white bg-black/20 px-3 py-2 rounded">
//                       {result.data.data?.blockNumber || result.data.blockNumber}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Result - Verify */}
//             {result && result.type === 'verify' && (
//               <div className={`mt-8 p-6 border rounded-xl backdrop-blur-sm ${
//                 result.data.isValid 
//                   ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-400/50' 
//                   : 'bg-gradient-to-br from-red-500/20 to-orange-500/20 border-red-400/50'
//               }`}>
//                 <div className="flex items-start gap-4 mb-6">
//                   <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
//                     result.data.isValid ? 'bg-green-500' : 'bg-red-500'
//                   }`}>
//                     {result.data.isValid ? <CheckCircle className="w-7 h-7 text-white" /> : <XCircle className="w-7 h-7 text-white" />}
//                   </div>
//                   <div>
//                     <h3 className={`font-bold text-xl ${result.data.isValid ? 'text-green-100' : 'text-red-100'}`}>
//                       {result.data.isValid ? '✓ Valid Certificate' : '✗ Invalid Certificate'}
//                     </h3>
//                     <p className={`text-sm mt-1 ${result.data.isValid ? 'text-green-200' : 'text-red-200'}`}>
//                       {result.data.isValid ? 'This certificate is verified on the blockchain' : 'This certificate was not found on the blockchain or has been revoked'}
//                     </p>
//                   </div>
//                 </div>
//                 {result.data.isValid && (
//                   <div className="bg-white/10 backdrop-blur-sm p-5 rounded-xl space-y-4 border border-white/20">
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
//                       <span className="text-cyan-200 font-semibold">Certificate Hash:</span>
//                       <span className="md:col-span-2 text-white font-mono text-xs break-all bg-black/20 px-3 py-2 rounded">
//                         {result.data.certificateHash}
//                       </span>
//                     </div>
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
//                       <span className="text-cyan-200 font-semibold">Issuer Address:</span>
//                       <span className="md:col-span-2 text-white font-mono text-xs break-all bg-black/20 px-3 py-2 rounded">
//                         {result.data.issuer}
//                       </span>
//                     </div>
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
//                       <span className="text-cyan-200 font-semibold">Issued Date:</span>
//                       <span className="md:col-span-2 text-white bg-black/20 px-3 py-2 rounded">
//                         {formatDate(result.data.issuedDate)}
//                       </span>
//                     </div>
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
//                       <span className="text-cyan-200 font-semibold">Blockchain Status:</span>
//                       <span className="md:col-span-2 text-emerald-300 font-semibold bg-black/20 px-3 py-2 rounded">
//                         ✓ Verified on Blockchain
//                       </span>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       <style>{`
//         @keyframes fadeIn {
//           from { opacity: 0; transform: translateY(10px); }
//           to { opacity: 1; transform: translateY(0); }
//         }
//         .animate-fadeIn {
//           animation: fadeIn 0.5s ease-out;
//         }
//       `}</style>
//     </div>
//   );
// }

// export default App;

// import React, { useState, useRef } from 'react';
// import { Upload, CheckCircle, XCircle, AlertCircle, Loader2, Shield, Sparkles, Award, QrCode, Download, Camera } from 'lucide-react';
// import jsQR from 'jsqr';

// const API_URL = 'http://localhost:5000';

// function App() {
//   const [activeTab, setActiveTab] = useState('issue');
//   const [file, setFile] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [result, setResult] = useState(null);
//   const [error, setError] = useState(null);
//   const [verificationMode, setVerificationMode] = useState('pdf');
//   const [revokeMode, setRevokeMode] = useState('pdf');
//   const [qrImage, setQrImage] = useState(null);
//   const fileInputRef = useRef(null);
//   const qrInputRef = useRef(null);
//   const revokeFileInputRef = useRef(null);
//   const revokeQrInputRef = useRef(null);

//   const handleFileChange = (e) => {
//     const selectedFile = e.target.files[0];
//     if (selectedFile && selectedFile.type === 'application/pdf') {
//       setFile(selectedFile);
//       setError(null);
//       setResult(null);
//     } else {
//       setError('Please select a valid PDF file');
//       setFile(null);
//     }
//   };

//   const handleQRImageChange = async (e) => {
//     const selectedFile = e.target.files[0];
//     if (selectedFile && selectedFile.type.startsWith('image/')) {
//       setQrImage(selectedFile);
//       setError(null);
//       setResult(null);
//       await processQRImage(selectedFile, 'verify');
//     } else {
//       setError('Please select a valid image file');
//       setQrImage(null);
//     }
//   };

//   const handleRevokeQRImageChange = async (e) => {
//     const selectedFile = e.target.files[0];
//     if (selectedFile && selectedFile.type.startsWith('image/')) {
//       setQrImage(selectedFile);
//       setError(null);
//       setResult(null);
//       await processQRImage(selectedFile, 'revoke');
//     } else {
//       setError('Please select a valid image file');
//       setQrImage(null);
//     }
//   };

//   const processQRImage = async (imageFile, mode = 'verify') => {
//     try {
//       setLoading(true);
//       const img = new Image();
//       const reader = new FileReader();

//       reader.onload = (e) => {
//         img.onload = async () => {
//           const canvas = document.createElement('canvas');
//           const context = canvas.getContext('2d');
//           canvas.width = img.width;
//           canvas.height = img.height;
//           context.drawImage(img, 0, 0);

//           const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
//           const code = jsQR(imageData.data, imageData.width, imageData.height);

//           if (code) {
//             console.log('QR Code detected:', code.data);
//             if (mode === 'verify') {
//               await verifyWithQRData(code.data);
//             } else if (mode === 'revoke') {
//               await revokeWithQRData(code.data);
//             }
//           } else {
//             setError('No QR code found in the image. Please try a clearer image.');
//             setLoading(false);
//           }
//         };
//         img.src = e.target.result;
//       };

//       reader.readAsDataURL(imageFile);
//     } catch (err) {
//       setError('Failed to process QR code image: ' + err.message);
//       setLoading(false);
//     }
//   };

//   const verifyWithQRData = async (qrData) => {
//     try {
//       const response = await fetch(`${API_URL}/api/verify-qr`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ qrData }),
//       });

//       const data = await response.json();

//       if (data.success) {
//         setResult({ type: 'verify', data: data.data });
//         setQrImage(null);
//       } else {
//         setError(data.message || 'Failed to verify certificate');
//       }
//     } catch (err) {
//       setError('Network error: ' + err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleIssueCertificate = async () => {
//     if (!file) {
//       setError('Please select a PDF file');
//       return;
//     }

//     setLoading(true);
//     setError(null);
//     setResult(null);

//     const formData = new FormData();
//     formData.append('certificate', file);

//     try {
//       const response = await fetch(`${API_URL}/api/issue-certificate`, {
//         method: 'POST',
//         body: formData,
//       });

//       const data = await response.json();

//       if (data.success) {
//         setResult({ type: 'issue', data });
//         setFile(null);
//         if (fileInputRef.current) fileInputRef.current.value = '';
//       } else {
//         setError(data.message || 'Failed to issue certificate');
//       }
//     } catch (err) {
//       setError('Network error: ' + err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleVerifyCertificate = async () => {
//     if (!file) {
//       setError('Please select a PDF file');
//       return;
//     }

//     setLoading(true);
//     setError(null);
//     setResult(null);

//     const formData = new FormData();
//     formData.append('certificate', file);

//     try {
//       const response = await fetch(`${API_URL}/api/verify-certificate`, {
//         method: 'POST',
//         body: formData,
//       });

//       const data = await response.json();

//       if (data.success) {
//         setResult({ type: 'verify', data: data.data });
//         setFile(null);
//         if (fileInputRef.current) fileInputRef.current.value = '';
//       } else {
//         setError(data.message || 'Failed to verify certificate');
//       }
//     } catch (err) {
//       setError('Network error: ' + err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const revokeWithQRData = async (qrData) => {
//     try {
//       let certificateHash;
      
//       try {
//         const parsed = JSON.parse(qrData);
//         if (parsed.type !== 'certificate' || !parsed.hash) {
//           throw new Error('Invalid QR code format');
//         }
//         certificateHash = parsed.hash;
//       } catch (e) {
//         setError('Invalid QR code format');
//         setLoading(false);
//         return;
//       }

//       console.log('Revoking certificate hash from QR:', certificateHash);

//       const response = await fetch(`${API_URL}/api/revoke-qr`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ qrData }),
//       });

//       const data = await response.json();

//       if (data.success) {
//         setResult({ type: 'revoke', data: data.data });
//         setQrImage(null);
//         if (revokeQrInputRef.current) revokeQrInputRef.current.value = '';
//       } else {
//         setError(data.message || 'Failed to revoke certificate');
//       }
//     } catch (err) {
//       setError('Network error: ' + err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleRevokeCertificate = async () => {
//     if (!file) {
//       setError('Please select a PDF file');
//       return;
//     }

//     setLoading(true);
//     setError(null);
//     setResult(null);

//     const formData = new FormData();
//     formData.append('certificate', file);

//     try {
//       const response = await fetch(`${API_URL}/api/revoke-certificate`, {
//         method: 'POST',
//         body: formData,
//       });

//       const data = await response.json();

//       if (data.success) {
//         setResult({ type: 'revoke', data: data.data });
//         setFile(null);
//         if (revokeFileInputRef.current) revokeFileInputRef.current.value = '';
//       } else {
//         setError(data.message || 'Failed to revoke certificate');
//       }
//     } catch (err) {
//       setError('Network error: ' + err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const downloadQRCode = () => {
//     if (result && result.type === 'issue' && result.data.data?.qrCode) {
//       const link = document.createElement('a');
//       link.href = result.data.data.qrCode;
//       link.download = `certificate-qr-${result.data.data.certificateHash.substring(0, 8)}.png`;
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//     }
//   };

//   const downloadFromIPFS = (ipfsUrl) => {
//     window.open(ipfsUrl, '_blank');
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return '-';
//     const date = new Date(dateString);
//     const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
//     return date.toLocaleDateString('en-US', options);
//   };

//   const resetForm = () => {
//     setResult(null);
//     setError(null);
//     setFile(null);
//     setQrImage(null);
//     setVerificationMode('pdf');
//     setRevokeMode('pdf');
//     if (fileInputRef.current) fileInputRef.current.value = '';
//     if (qrInputRef.current) qrInputRef.current.value = '';
//     if (revokeFileInputRef.current) revokeFileInputRef.current.value = '';
//     if (revokeQrInputRef.current) revokeQrInputRef.current.value = '';
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 relative overflow-hidden">
//       <div className="absolute inset-0 opacity-20">
//         <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
//         <div className="absolute top-40 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-700"></div>
//         <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
//       </div>

//       <div className="container mx-auto px-4 py-8 max-w-5xl relative z-10">
//         <div className="text-center mb-10">
//           <div className="flex items-center justify-center mb-6 gap-3">
//             <div className="relative">
//               <Shield className="w-16 h-16 text-cyan-400" strokeWidth={1.5} />
//               <Sparkles className="w-6 h-6 text-yellow-300 absolute -top-2 -right-2 animate-pulse" />
//             </div>
//           </div>
//           <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 mb-3 tracking-tight">
//             Blockchain Certificate System
//           </h1>
//           <p className="text-cyan-100 text-lg font-light">
//             Secure, Transparent, and Immutable Certificate Verification with QR Codes & IPFS
//           </p>
//         </div>

//         <div className="flex gap-4 mb-8 backdrop-blur-sm bg-white/5 p-2 rounded-2xl border border-white/10">
//           <button
//             onClick={() => { setActiveTab('issue'); resetForm(); }}
//             className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${
//               activeTab === 'issue'
//                 ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/50 scale-105'
//                 : 'text-cyan-100 hover:bg-white/10'
//             }`}
//           >
//             <div className="flex items-center justify-center gap-2">
//               <Award className="w-5 h-5" />
//               Issue Certificate
//             </div>
//           </button>
//           <button
//             onClick={() => { setActiveTab('verify'); resetForm(); }}
//             className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${
//               activeTab === 'verify'
//                 ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/50 scale-105'
//                 : 'text-cyan-100 hover:bg-white/10'
//             }`}
//           >
//             <div className="flex items-center justify-center gap-2">
//               <Shield className="w-5 h-5" />
//               Verify Certificate
//             </div>
//           </button>
//           <button
//             onClick={() => { setActiveTab('revoke'); resetForm(); }}
//             className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${
//               activeTab === 'revoke'
//                 ? 'bg-gradient-to-r from-red-500 to-orange-600 text-white shadow-lg shadow-red-500/50 scale-105'
//                 : 'text-cyan-100 hover:bg-white/10'
//             }`}
//           >
//             <div className="flex items-center justify-center gap-2">
//               <XCircle className="w-5 h-5" />
//               Revoke Certificate
//             </div>
//           </button>
//         </div>

//         <div className="backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
//           <div className="p-8 md:p-10">
//             {activeTab === 'issue' && (
//               <div>
//                 <div className="space-y-6">
//                   <div>
//                     <label className="block text-sm font-semibold text-cyan-100 mb-3">Certificate PDF</label>
//                     <input 
//                       type="file" 
//                       accept=".pdf" 
//                       onChange={handleFileChange} 
//                       className="hidden" 
//                       id="issue-file-upload"
//                       ref={fileInputRef}
//                     />
//                     <label htmlFor="issue-file-upload" className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-cyan-400/50 rounded-xl cursor-pointer hover:border-cyan-400 hover:bg-white/10 transition-all backdrop-blur-sm bg-white/5 group">
//                       <Upload className="w-12 h-12 text-cyan-400 mb-4 group-hover:scale-110 transition-transform" />
//                       <span className="text-base text-cyan-100 font-medium">{file ? file.name : 'Click to upload PDF certificate'}</span>
//                       <span className="text-sm text-cyan-300/70 mt-2">PDF will be hashed, stored on IPFS, and registered on blockchain</span>
//                     </label>
//                   </div>

//                   <button onClick={handleIssueCertificate} disabled={loading} className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-4 px-6 rounded-xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-cyan-500/50 transition-all">
//                     {loading ? <><Loader2 className="w-6 h-6 animate-spin" /> Processing...</> : <><CheckCircle className="w-6 h-6" /> Issue Certificate</>}
//                   </button>
//                 </div>
//               </div>
//             )}
//             {activeTab === 'verify' && (
//               <div>
//                 <div className="space-y-6">
//                   <div className="flex gap-3 p-1 backdrop-blur-sm bg-white/5 rounded-xl border border-white/10">
//                     <button
//                       onClick={() => { setVerificationMode('pdf'); setResult(null); setError(null); setQrImage(null); }}
//                       className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${
//                         verificationMode === 'pdf'
//                           ? 'bg-purple-500 text-white shadow-md'
//                           : 'text-purple-100 hover:bg-white/10'
//                       }`}
//                     >
//                       <div className="flex items-center justify-center gap-2">
//                         <Upload className="w-4 h-4" />
//                         Upload PDF
//                       </div>
//                     </button>
//                     <button
//                       onClick={() => { setVerificationMode('qr'); setResult(null); setError(null); setFile(null); }}
//                       className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${
//                         verificationMode === 'qr'
//                           ? 'bg-purple-500 text-white shadow-md'
//                           : 'text-purple-100 hover:bg-white/10'
//                       }`}
//                     >
//                       <div className="flex items-center justify-center gap-2">
//                         <QrCode className="w-4 h-4" />
//                         Scan QR Code
//                       </div>
//                     </button>
//                   </div>

//                   {verificationMode === 'pdf' && (
//                     <>
//                       <div>
//                         <label className="block text-sm font-semibold text-purple-100 mb-3">Upload Certificate PDF</label>
//                         <input 
//                           type="file" 
//                           accept=".pdf" 
//                           onChange={handleFileChange} 
//                           className="hidden" 
//                           id="verify-file-upload"
//                           ref={fileInputRef}
//                         />
//                         <label htmlFor="verify-file-upload" className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-purple-400/50 rounded-xl cursor-pointer hover:border-purple-400 hover:bg-white/10 transition-all backdrop-blur-sm bg-white/5 group">
//                           <Upload className="w-12 h-12 text-purple-400 mb-4 group-hover:scale-110 transition-transform" />
//                           <span className="text-base text-purple-100 font-medium">{file ? file.name : 'Click to upload certificate PDF'}</span>
//                           <span className="text-sm text-purple-300/70 mt-2">Verify authenticity on blockchain</span>
//                         </label>
//                       </div>
//                       <button onClick={handleVerifyCertificate} disabled={loading} className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-4 px-6 rounded-xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-purple-500/50 transition-all">
//                         {loading ? <><Loader2 className="w-6 h-6 animate-spin" /> Verifying...</> : <><Shield className="w-6 h-6" /> Verify Certificate</>}
//                       </button>
//                     </>
//                   )}

//                   {verificationMode === 'qr' && (
//                     <>
//                       <div>
//                         <label className="block text-sm font-semibold text-purple-100 mb-3">Upload QR Code Image</label>
//                         <input 
//                           type="file" 
//                           accept="image/*" 
//                           onChange={handleQRImageChange} 
//                           className="hidden" 
//                           id="qr-file-upload"
//                           ref={qrInputRef}
//                         />
//                         <label htmlFor="qr-file-upload" className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-purple-400/50 rounded-xl cursor-pointer hover:border-purple-400 hover:bg-white/10 transition-all backdrop-blur-sm bg-white/5 group">
//                           <Camera className="w-12 h-12 text-purple-400 mb-4 group-hover:scale-110 transition-transform" />
//                           <span className="text-base text-purple-100 font-medium">{qrImage ? qrImage.name : 'Click to upload QR code image'}</span>
//                           <span className="text-sm text-purple-300/70 mt-2">Automatically scans and verifies on blockchain</span>
//                         </label>
//                       </div>
//                       {loading && (
//                         <div className="flex items-center justify-center gap-3 text-purple-100">
//                           <Loader2 className="w-6 h-6 animate-spin" />
//                           <span>Scanning QR code and verifying...</span>
//                         </div>
//                       )}
//                     </>
//                   )}
//                 </div>
//               </div>
//             )}

//             {activeTab === 'revoke' && (
//               <div>
//                 <div className="space-y-6">
//                   <div className="flex gap-3 p-1 backdrop-blur-sm bg-white/5 rounded-xl border border-white/10">
//                     <button
//                       onClick={() => { setRevokeMode('pdf'); setResult(null); setError(null); setQrImage(null); }}
//                       className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${
//                         revokeMode === 'pdf'
//                           ? 'bg-red-500 text-white shadow-md'
//                           : 'text-red-100 hover:bg-white/10'
//                       }`}
//                     >
//                       <div className="flex items-center justify-center gap-2">
//                         <Upload className="w-4 h-4" />
//                         Upload PDF
//                       </div>
//                     </button>
//                     <button
//                       onClick={() => { setRevokeMode('qr'); setResult(null); setError(null); setFile(null); }}
//                       className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${
//                         revokeMode === 'qr'
//                           ? 'bg-red-500 text-white shadow-md'
//                           : 'text-red-100 hover:bg-white/10'
//                       }`}
//                     >
//                       <div className="flex items-center justify-center gap-2">
//                         <QrCode className="w-4 h-4" />
//                         Scan QR Code
//                       </div>
//                     </button>
//                   </div>

//                   {revokeMode === 'pdf' && (
//                     <>
//                       <div>
//                         <label className="block text-sm font-semibold text-red-100 mb-3">Upload Certificate PDF to Revoke</label>
//                         <input 
//                           type="file" 
//                           accept=".pdf" 
//                           onChange={handleFileChange} 
//                           className="hidden" 
//                           id="revoke-file-upload"
//                           ref={revokeFileInputRef}
//                         />
//                         <label htmlFor="revoke-file-upload" className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-red-400/50 rounded-xl cursor-pointer hover:border-red-400 hover:bg-white/10 transition-all backdrop-blur-sm bg-white/5 group">
//                           <Upload className="w-12 h-12 text-red-400 mb-4 group-hover:scale-110 transition-transform" />
//                           <span className="text-base text-red-100 font-medium">{file ? file.name : 'Click to upload certificate PDF'}</span>
//                           <span className="text-sm text-red-300/70 mt-2">Revoke certificate from blockchain</span>
//                         </label>
//                       </div>
//                       <div className="bg-red-500/10 border border-red-400/30 rounded-lg p-4">
//                         <div className="flex items-start gap-3">
//                           <AlertCircle className="w-5 h-5 text-red-300 flex-shrink-0 mt-0.5" />
//                           <div className="text-sm text-red-200">
//                             <p className="font-semibold mb-1">Warning: Irreversible Action</p>
//                             <p>Revoking a certificate will permanently invalidate it on the blockchain. This action cannot be undone.</p>
//                           </div>
//                         </div>
//                       </div>
//                       <button onClick={handleRevokeCertificate} disabled={loading} className="w-full bg-gradient-to-r from-red-500 to-orange-600 text-white py-4 px-6 rounded-xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-red-500/50 transition-all">
//                         {loading ? <><Loader2 className="w-6 h-6 animate-spin" /> Revoking...</> : <><XCircle className="w-6 h-6" /> Revoke Certificate</>}
//                       </button>
//                     </>
//                   )}

//                   {revokeMode === 'qr' && (
//                     <>
//                       <div>
//                         <label className="block text-sm font-semibold text-red-100 mb-3">Upload QR Code Image to Revoke</label>
//                         <input 
//                           type="file" 
//                           accept="image/*" 
//                           onChange={handleRevokeQRImageChange} 
//                           className="hidden" 
//                           id="revoke-qr-file-upload"
//                           ref={revokeQrInputRef}
//                         />
//                         <label htmlFor="revoke-qr-file-upload" className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-red-400/50 rounded-xl cursor-pointer hover:border-red-400 hover:bg-white/10 transition-all backdrop-blur-sm bg-white/5 group">
//                           <Camera className="w-12 h-12 text-red-400 mb-4 group-hover:scale-110 transition-transform" />
//                           <span className="text-base text-red-100 font-medium">{qrImage ? qrImage.name : 'Click to upload QR code image'}</span>
//                           <span className="text-sm text-red-300/70 mt-2">Automatically scans and revokes on blockchain</span>
//                         </label>
//                       </div>
//                       <div className="bg-red-500/10 border border-red-400/30 rounded-lg p-4">
//                         <div className="flex items-start gap-3">
//                           <AlertCircle className="w-5 h-5 text-red-300 flex-shrink-0 mt-0.5" />
//                           <div className="text-sm text-red-200">
//                             <p className="font-semibold mb-1">Warning: Irreversible Action</p>
//                             <p>Revoking a certificate will permanently invalidate it on the blockchain. This action cannot be undone.</p>
//                           </div>
//                         </div>
//                       </div>
//                       {loading && (
//                         <div className="flex items-center justify-center gap-3 text-red-100">
//                           <Loader2 className="w-6 h-6 animate-spin" />
//                           <span>Scanning QR code and revoking...</span>
//                         </div>
//                       )}
//                     </>
//                   )}
//                 </div>
//               </div>
//             )}

//             {error && (
//               <div className="mt-8 p-5 bg-red-500/20 border border-red-400/50 rounded-xl flex items-start gap-4 backdrop-blur-sm animate-pulse">
//                 <XCircle className="w-6 h-6 text-red-300 flex-shrink-0 mt-0.5" />
//                 <div>
//                   <h3 className="font-bold text-red-200 text-lg">Error</h3>
//                   <p className="text-sm text-red-300 mt-1">{error}</p>
//                 </div>
//               </div>
//             )}

//             {result && result.type === 'issue' && (
//               <div className="mt-8 p-6 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-400/50 rounded-xl backdrop-blur-sm">
//                 <div className="flex items-start gap-4 mb-6">
//                   <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
//                     <CheckCircle className="w-7 h-7 text-white" />
//                   </div>
//                   <div>
//                     <h3 className="font-bold text-green-100 text-xl">Certificate Issued Successfully!</h3>
//                     <p className="text-green-200 text-sm mt-1">Permanently stored on blockchain and IPFS</p>
//                   </div>
//                 </div>

//                 {result.data.data?.qrCode && (
//                   <div className="mb-6 p-6 bg-white rounded-xl shadow-lg">
//                     <div className="text-center">
//                       <h4 className="font-bold text-gray-800 mb-4 flex items-center justify-center gap-2">
//                         <QrCode className="w-5 h-5" />
//                         Certificate QR Code
//                       </h4>
//                       <img 
//                         src={result.data.data.qrCode} 
//                         alt="Certificate QR Code" 
//                         className="mx-auto mb-4 border-4 border-gray-200 rounded-lg"
//                         style={{ width: '256px', height: '256px' }}
//                       />
//                       <button
//                         onClick={downloadQRCode}
//                         className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-6 rounded-lg font-semibold flex items-center gap-2 mx-auto hover:shadow-lg transition-all"
//                       >
//                         <Download className="w-4 h-4" />
//                         Download QR Code
//                       </button>
//                       <p className="text-xs text-gray-600 mt-3">
//                         Use this QR code for quick verification
//                       </p>
//                     </div>
//                   </div>
//                 )}

//                 <div className="bg-white/10 backdrop-blur-sm p-5 rounded-xl space-y-4 border border-white/20">
//                   <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
//                     <span className="text-cyan-200 font-semibold">Certificate Hash:</span>
//                     <span className="md:col-span-2 text-white font-mono text-xs break-all bg-black/20 px-3 py-2 rounded">
//                       {result.data.data?.certificateHash || result.data.certificateHash}
//                     </span>
//                   </div>
//                   <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
//                     <span className="text-cyan-200 font-semibold">IPFS CID:</span>
//                     <span className="md:col-span-2 text-white font-mono text-xs break-all bg-black/20 px-3 py-2 rounded">
//                       {result.data.data?.ipfsCID}
//                     </span>
//                   </div>
//                   {result.data.data?.ipfsUrl && (
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
//                       <span className="text-cyan-200 font-semibold">IPFS Link:</span>
//                       <div className="md:col-span-2">
//                         <button
//                           onClick={() => downloadFromIPFS(result.data.data.ipfsUrl)}
//                           className="text-cyan-300 hover:text-cyan-100 underline text-xs break-all"
//                         >
//                           View on IPFS
//                         </button>
//                       </div>
//                     </div>
//                   )}
//                   <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
//                     <span className="text-cyan-200 font-semibold">Issuer Address:</span>
//                     <span className="md:col-span-2 text-white font-mono text-xs break-all bg-black/20 px-3 py-2 rounded">
//                       {result.data.data?.issuer || result.data.issuer}
//                     </span>
//                   </div>
//                   <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
//                     <span className="text-cyan-200 font-semibold">Transaction Hash:</span>
//                     <span className="md:col-span-2 text-white font-mono text-xs break-all bg-black/20 px-3 py-2 rounded">
//                       {result.data.data?.transactionHash || result.data.transactionHash}
//                     </span>
//                   </div>
//                   <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
//                     <span className="text-cyan-200 font-semibold">Block Number:</span>
//                     <span className="md:col-span-2 text-white bg-black/20 px-3 py-2 rounded">
//                       {result.data.data?.blockNumber || result.data.blockNumber}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {result && result.type === 'verify' && (
//               <div className={`mt-8 p-6 border rounded-xl backdrop-blur-sm ${
//                 result.data.isValid 
//                   ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-400/50' 
//                   : 'bg-gradient-to-br from-red-500/20 to-orange-500/20 border-red-400/50'
//               }`}>
//                 <div className="flex items-start gap-4 mb-6">
//                   <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
//                     result.data.isValid ? 'bg-green-500' : 'bg-red-500'
//                   }`}>
//                     {result.data.isValid ? <CheckCircle className="w-7 h-7 text-white" /> : <XCircle className="w-7 h-7 text-white" />}
//                   </div>
//                   <div>
//                     <h3 className={`font-bold text-xl ${result.data.isValid ? 'text-green-100' : 'text-red-100'}`}>
//                       {result.data.isValid ? '✓ Valid Certificate' : '✗ Invalid Certificate'}
//                     </h3>
//                     <p className={`text-sm mt-1 ${result.data.isValid ? 'text-green-200' : 'text-red-200'}`}>
//                       {result.data.isValid ? 'This certificate is verified on the blockchain' : 'This certificate was not found on the blockchain or has been revoked'}
//                     </p>
//                     {result.data.verificationMethod && (
//                       <p className={`text-xs mt-2 flex items-center gap-1 ${result.data.isValid ? 'text-green-300' : 'text-red-300'}`}>
//                         {result.data.verificationMethod === 'QR Code' ? <QrCode className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
//                         Verified via {result.data.verificationMethod}
//                       </p>
//                     )}
//                   </div>
//                 </div>
//                 {result.data.isValid && (
//                   <div className="bg-white/10 backdrop-blur-sm p-5 rounded-xl space-y-4 border border-white/20">
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
//                       <span className="text-cyan-200 font-semibold">Certificate Hash:</span>
//                       <span className="md:col-span-2 text-white font-mono text-xs break-all bg-black/20 px-3 py-2 rounded">
//                         {result.data.certificateHash}
//                       </span>
//                     </div>
//                     {result.data.ipfsCID && (
//                       <>
//                         <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
//                           <span className="text-cyan-200 font-semibold">IPFS CID:</span>
//                           <span className="md:col-span-2 text-white font-mono text-xs break-all bg-black/20 px-3 py-2 rounded">
//                             {result.data.ipfsCID}
//                           </span>
//                         </div>
//                         {result.data.ipfsUrl && (
//                           <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
//                             <span className="text-cyan-200 font-semibold">Download:</span>
//                             <div className="md:col-span-2">
//                               <button
//                                 onClick={() => downloadFromIPFS(result.data.ipfsUrl)}
//                                 className="text-cyan-300 hover:text-cyan-100 underline text-xs"
//                               >
//                                 View Certificate on IPFS
//                               </button>
//                             </div>
//                           </div>
//                         )}
//                       </>
//                     )}
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
//                       <span className="text-cyan-200 font-semibold">Issuer Address:</span>
//                       <span className="md:col-span-2 text-white font-mono text-xs break-all bg-black/20 px-3 py-2 rounded">
//                         {result.data.issuer}
//                       </span>
//                     </div>
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
//                       <span className="text-cyan-200 font-semibold">Issued Date:</span>
//                       <span className="md:col-span-2 text-white bg-black/20 px-3 py-2 rounded">
//                         {formatDate(result.data.issuedDate)}
//                       </span>
//                     </div>
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
//                       <span className="text-cyan-200 font-semibold">Blockchain Status:</span>
//                       <span className="md:col-span-2 text-emerald-300 font-semibold bg-black/20 px-3 py-2 rounded">
//                         ✓ Verified on Blockchain
//                       </span>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             )}

//             {result && result.type === 'revoke' && (
//               <div className="mt-8 p-6 bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-400/50 rounded-xl backdrop-blur-sm">
//                 <div className="flex items-start gap-4 mb-6">
//                   <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
//                     <XCircle className="w-7 h-7 text-white" />
//                   </div>
//                   <div>
//                     <h3 className="font-bold text-orange-100 text-xl">Certificate Revoked Successfully!</h3>
//                     <p className="text-orange-200 text-sm mt-1">Certificate has been permanently invalidated on blockchain</p>
//                   </div>
//                 </div>
//                 <div className="bg-white/10 backdrop-blur-sm p-5 rounded-xl space-y-4 border border-white/20">
//                   <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
//                     <span className="text-cyan-200 font-semibold">Certificate Hash:</span>
//                     <span className="md:col-span-2 text-white font-mono text-xs break-all bg-black/20 px-3 py-2 rounded">
//                       {result.data.certificateHash}
//                     </span>
//                   </div>
//                   <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
//                     <span className="text-cyan-200 font-semibold">Transaction Hash:</span>
//                     <span className="md:col-span-2 text-white font-mono text-xs break-all bg-black/20 px-3 py-2 rounded">
//                       {result.data.transactionHash}
//                     </span>
//                   </div>
//                   <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
//                     <span className="text-cyan-200 font-semibold">Block Number:</span>
//                     <span className="md:col-span-2 text-white bg-black/20 px-3 py-2 rounded">
//                       {result.data.blockNumber}
//                     </span>
//                   </div>
//                   <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-4 mt-4">
//                     <div className="flex items-start gap-3">
//                       <AlertCircle className="w-5 h-5 text-red-300 flex-shrink-0 mt-0.5" />
//                       <div className="text-sm text-red-200">
//                         <p className="font-semibold">This certificate is now invalid</p>
//                         <p className="mt-1">Any verification attempts will show this certificate as revoked</p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       <style>{`
//         @keyframes fadeIn {
//           from { opacity: 0; transform: translateY(10px); }
//           to { opacity: 1; transform: translateY(0); }
//         }
//         .animate-fadeIn {
//           animation: fadeIn 0.5s ease-out;
//         }
//       `}</style>
//     </div>
//   );
// }

// export default App;



import React, { useState, useRef } from 'react';
import { Upload, CheckCircle, XCircle, AlertCircle, Loader2, Shield, Sparkles, Award, QrCode, Download, Camera } from 'lucide-react';
import jsQR from 'jsqr';

const API_URL = 'http://localhost:3000';

function App() {
  const [activeTab, setActiveTab] = useState('issue');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [verificationMode, setVerificationMode] = useState('pdf');
  const [revokeMode, setRevokeMode] = useState('pdf');
  const [qrImage, setQrImage] = useState(null);
  const fileInputRef = useRef(null);
  const qrInputRef = useRef(null);
  const revokeFileInputRef = useRef(null);
  const revokeQrInputRef = useRef(null);

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

  const handleQRImageChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      setQrImage(selectedFile);
      setError(null);
      setResult(null);
      await processQRImage(selectedFile, 'verify');
    } else {
      setError('Please select a valid image file');
      setQrImage(null);
    }
  };

  const handleRevokeQRImageChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      setQrImage(selectedFile);
      setError(null);
      setResult(null);
      await processQRImage(selectedFile, 'revoke');
    } else {
      setError('Please select a valid image file');
      setQrImage(null);
    }
  };

  const processQRImage = async (imageFile, mode = 'verify') => {
    try {
      setLoading(true);
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.onload = async () => {
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.width = img.width;
          canvas.height = img.height;
          context.drawImage(img, 0, 0);

          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);

          if (code) {
            console.log('QR Code detected:', code.data);
            if (mode === 'verify') {
              await verifyWithQRData(code.data);
            } else if (mode === 'revoke') {
              await revokeWithQRData(code.data);
            }
          } else {
            setError('No QR code found in the image. Please try a clearer image.');
            setLoading(false);
          }
        };
        img.src = e.target.result;
      };

      reader.readAsDataURL(imageFile);
    } catch (err) {
      setError('Failed to process QR code image: ' + err.message);
      setLoading(false);
    }
  };

  const verifyWithQRData = async (qrData) => {
    try {
      const response = await fetch(`${API_URL}/api/verify-qr`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ qrData }),
      });

      const data = await response.json();

      if (data.success) {
        setResult({ type: 'verify', data: data.data });
        setQrImage(null);
      } else {
        setError(data.message || 'Failed to verify certificate');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
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
        if (fileInputRef.current) fileInputRef.current.value = '';
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
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        setError(data.message || 'Failed to verify certificate');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const revokeWithQRData = async (qrData) => {
    try {
      let certificateHash;
      
      try {
        const parsed = JSON.parse(qrData);
        if (parsed.type !== 'certificate' || !parsed.hash) {
          throw new Error('Invalid QR code format');
        }
        certificateHash = parsed.hash;
      } catch (e) {
        setError('Invalid QR code format');
        setLoading(false);
        return;
      }

      console.log('Revoking certificate hash from QR:', certificateHash);

      const response = await fetch(`${API_URL}/api/revoke-qr`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ qrData }),
      });

      const data = await response.json();

      if (data.success) {
        setResult({ type: 'revoke', data: data.data });
        setQrImage(null);
        if (revokeQrInputRef.current) revokeQrInputRef.current.value = '';
      } else {
        setError(data.message || 'Failed to revoke certificate');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeCertificate = async () => {
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
      const response = await fetch(`${API_URL}/api/revoke-certificate`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setResult({ type: 'revoke', data: data.data });
        setFile(null);
        if (revokeFileInputRef.current) revokeFileInputRef.current.value = '';
      } else {
        setError(data.message || 'Failed to revoke certificate');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = () => {
    if (result && result.type === 'issue' && result.data.data?.qrCode) {
      const link = document.createElement('a');
      link.href = result.data.data.qrCode;
      link.download = `certificate-qr-${result.data.data.certificateHash.substring(0, 8)}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const downloadFromIPFS = (ipfsUrl, filename) => {
    const link = document.createElement('a');
    link.href = ipfsUrl;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return date.toLocaleDateString('en-US', options);
  };

  const resetForm = () => {
    setResult(null);
    setError(null);
    setFile(null);
    setQrImage(null);
    setVerificationMode('pdf');
    setRevokeMode('pdf');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (qrInputRef.current) qrInputRef.current.value = '';
    if (revokeFileInputRef.current) revokeFileInputRef.current.value = '';
    if (revokeQrInputRef.current) revokeQrInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-700"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl relative z-10">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center mb-6 gap-3">
            <div className="relative">
              <Shield className="w-16 h-16 text-cyan-400" strokeWidth={1.5} />
              <Sparkles className="w-6 h-6 text-yellow-300 absolute -top-2 -right-2 animate-pulse" />
            </div>
          </div>
          <div>
  <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 mb-3 tracking-tight">
    CertiChain
  </h1>
  <h2 className="text-3xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 mb-3 tracking-tight">
    Blockchain Powered Certificate Issuance & Verification System
  </h2>
</div>
          <p className="text-cyan-100 text-lg font-light">
            Secure, Transparent, and Immutable Certificate Verification with QR Codes & IPFS
          </p>
        </div>

        <div className="flex gap-4 mb-8 backdrop-blur-sm bg-white/5 p-2 rounded-2xl border border-white/10">
          <button
            onClick={() => { setActiveTab('issue'); resetForm(); }}
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
            onClick={() => { setActiveTab('verify'); resetForm(); }}
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
          <button
            onClick={() => { setActiveTab('revoke'); resetForm(); }}
            className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${
              activeTab === 'revoke'
                ? 'bg-gradient-to-r from-red-500 to-orange-600 text-white shadow-lg shadow-red-500/50 scale-105'
                : 'text-cyan-100 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <XCircle className="w-5 h-5" />
              Revoke Certificate
            </div>
          </button>
        </div>

        <div className="backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="p-8 md:p-10">
            {activeTab === 'issue' && (
              <div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-cyan-100 mb-3">Certificate PDF</label>
                    <input 
                      type="file" 
                      accept=".pdf" 
                      onChange={handleFileChange} 
                      className="hidden" 
                      id="issue-file-upload"
                      ref={fileInputRef}
                    />
                    <label htmlFor="issue-file-upload" className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-cyan-400/50 rounded-xl cursor-pointer hover:border-cyan-400 hover:bg-white/10 transition-all backdrop-blur-sm bg-white/5 group">
                      <Upload className="w-12 h-12 text-cyan-400 mb-4 group-hover:scale-110 transition-transform" />
                      <span className="text-base text-cyan-100 font-medium">{file ? file.name : 'Click to upload PDF certificate'}</span>
                      <span className="text-sm text-cyan-300/70 mt-2">PDF will be hashed and stored on blockchain + IPFS</span>
                    </label>
                  </div>

                  <button onClick={handleIssueCertificate} disabled={loading} className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-4 px-6 rounded-xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-cyan-500/50 transition-all">
                    {loading ? <><Loader2 className="w-6 h-6 animate-spin" /> Processing...</> : <><CheckCircle className="w-6 h-6" /> Issue Certificate</>}
                  </button>
                </div>
              </div>
            )}
            {activeTab === 'verify' && (
              <div>
                <div className="space-y-6">
                  <div className="flex gap-3 p-1 backdrop-blur-sm bg-white/5 rounded-xl border border-white/10">
                    <button
                      onClick={() => { setVerificationMode('pdf'); setResult(null); setError(null); setQrImage(null); }}
                      className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${
                        verificationMode === 'pdf'
                          ? 'bg-purple-500 text-white shadow-md'
                          : 'text-purple-100 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Upload className="w-4 h-4" />
                        Upload PDF
                      </div>
                    </button>
                    <button
                      onClick={() => { setVerificationMode('qr'); setResult(null); setError(null); setFile(null); }}
                      className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${
                        verificationMode === 'qr'
                          ? 'bg-purple-500 text-white shadow-md'
                          : 'text-purple-100 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <QrCode className="w-4 h-4" />
                        Scan QR Code
                      </div>
                    </button>
                  </div>

                  {verificationMode === 'pdf' && (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-purple-100 mb-3">Upload Certificate PDF</label>
                        <input 
                          type="file" 
                          accept=".pdf" 
                          onChange={handleFileChange} 
                          className="hidden" 
                          id="verify-file-upload"
                          ref={fileInputRef}
                        />
                        <label htmlFor="verify-file-upload" className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-purple-400/50 rounded-xl cursor-pointer hover:border-purple-400 hover:bg-white/10 transition-all backdrop-blur-sm bg-white/5 group">
                          <Upload className="w-12 h-12 text-purple-400 mb-4 group-hover:scale-110 transition-transform" />
                          <span className="text-base text-purple-100 font-medium">{file ? file.name : 'Click to upload certificate PDF'}</span>
                          <span className="text-sm text-purple-300/70 mt-2">Verify authenticity on blockchain</span>
                        </label>
                      </div>
                      <button onClick={handleVerifyCertificate} disabled={loading} className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-4 px-6 rounded-xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-purple-500/50 transition-all">
                        {loading ? <><Loader2 className="w-6 h-6 animate-spin" /> Verifying...</> : <><Shield className="w-6 h-6" /> Verify Certificate</>}
                      </button>
                    </>
                  )}

                  {verificationMode === 'qr' && (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-purple-100 mb-3">Upload QR Code Image</label>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleQRImageChange} 
                          className="hidden" 
                          id="qr-file-upload"
                          ref={qrInputRef}
                        />
                        <label htmlFor="qr-file-upload" className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-purple-400/50 rounded-xl cursor-pointer hover:border-purple-400 hover:bg-white/10 transition-all backdrop-blur-sm bg-white/5 group">
                          <Camera className="w-12 h-12 text-purple-400 mb-4 group-hover:scale-110 transition-transform" />
                          <span className="text-base text-purple-100 font-medium">{qrImage ? qrImage.name : 'Click to upload QR code image'}</span>
                          <span className="text-sm text-purple-300/70 mt-2">Automatically scans and verifies on blockchain</span>
                        </label>
                      </div>
                      {loading && (
                        <div className="flex items-center justify-center gap-3 text-purple-100">
                          <Loader2 className="w-6 h-6 animate-spin" />
                          <span>Scanning QR code and verifying...</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'revoke' && (
              <div>
                <div className="space-y-6">
                  <div className="flex gap-3 p-1 backdrop-blur-sm bg-white/5 rounded-xl border border-white/10">
                    <button
                      onClick={() => { setRevokeMode('pdf'); setResult(null); setError(null); setQrImage(null); }}
                      className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${
                        revokeMode === 'pdf'
                          ? 'bg-red-500 text-white shadow-md'
                          : 'text-red-100 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Upload className="w-4 h-4" />
                        Upload PDF
                      </div>
                    </button>
                    <button
                      onClick={() => { setRevokeMode('qr'); setResult(null); setError(null); setFile(null); }}
                      className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${
                        revokeMode === 'qr'
                          ? 'bg-red-500 text-white shadow-md'
                          : 'text-red-100 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <QrCode className="w-4 h-4" />
                        Scan QR Code
                      </div>
                    </button>
                  </div>

                  {revokeMode === 'pdf' && (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-red-100 mb-3">Upload Certificate PDF to Revoke</label>
                        <input 
                          type="file" 
                          accept=".pdf" 
                          onChange={handleFileChange} 
                          className="hidden" 
                          id="revoke-file-upload"
                          ref={revokeFileInputRef}
                        />
                        <label htmlFor="revoke-file-upload" className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-red-400/50 rounded-xl cursor-pointer hover:border-red-400 hover:bg-white/10 transition-all backdrop-blur-sm bg-white/5 group">
                          <Upload className="w-12 h-12 text-red-400 mb-4 group-hover:scale-110 transition-transform" />
                          <span className="text-base text-red-100 font-medium">{file ? file.name : 'Click to upload certificate PDF'}</span>
                          <span className="text-sm text-red-300/70 mt-2">Revoke certificate from blockchain</span>
                        </label>
                      </div>
                      <div className="bg-red-500/10 border border-red-400/30 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-red-300 flex-shrink-0 mt-0.5" />
                          <div className="text-sm text-red-200">
                            <p className="font-semibold mb-1">Warning: Irreversible Action</p>
                            <p>Revoking a certificate will permanently invalidate it on the blockchain. This action cannot be undone.</p>
                          </div>
                        </div>
                      </div>
                      <button onClick={handleRevokeCertificate} disabled={loading} className="w-full bg-gradient-to-r from-red-500 to-orange-600 text-white py-4 px-6 rounded-xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-red-500/50 transition-all">
                        {loading ? <><Loader2 className="w-6 h-6 animate-spin" /> Revoking...</> : <><XCircle className="w-6 h-6" /> Revoke Certificate</>}
                      </button>
                    </>
                  )}

                  {revokeMode === 'qr' && (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-red-100 mb-3">Upload QR Code Image to Revoke</label>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleRevokeQRImageChange} 
                          className="hidden" 
                          id="revoke-qr-file-upload"
                          ref={revokeQrInputRef}
                        />
                        <label htmlFor="revoke-qr-file-upload" className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-red-400/50 rounded-xl cursor-pointer hover:border-red-400 hover:bg-white/10 transition-all backdrop-blur-sm bg-white/5 group">
                          <Camera className="w-12 h-12 text-red-400 mb-4 group-hover:scale-110 transition-transform" />
                          <span className="text-base text-red-100 font-medium">{qrImage ? qrImage.name : 'Click to upload QR code image'}</span>
                          <span className="text-sm text-red-300/70 mt-2">Automatically scans and revokes on blockchain</span>
                        </label>
                      </div>
                      <div className="bg-red-500/10 border border-red-400/30 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-red-300 flex-shrink-0 mt-0.5" />
                          <div className="text-sm text-red-200">
                            <p className="font-semibold mb-1">Warning: Irreversible Action</p>
                            <p>Revoking a certificate will permanently invalidate it on the blockchain. This action cannot be undone.</p>
                          </div>
                        </div>
                      </div>
                      {loading && (
                        <div className="flex items-center justify-center gap-3 text-red-100">
                          <Loader2 className="w-6 h-6 animate-spin" />
                          <span>Scanning QR code and revoking...</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {error && (
              <div className="mt-8 p-5 bg-red-500/20 border border-red-400/50 rounded-xl flex items-start gap-4 backdrop-blur-sm animate-pulse">
                <XCircle className="w-6 h-6 text-red-300 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-red-200 text-lg">Error</h3>
                  <p className="text-sm text-red-300 mt-1">{error}</p>
                </div>
              </div>
            )}

            {result && result.type === 'issue' && (
              <div className="mt-8 p-6 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-400/50 rounded-xl backdrop-blur-sm">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-green-100 text-xl">Certificate Issued Successfully!</h3>
                    <p className="text-green-200 text-sm mt-1">Permanently stored on blockchain & IPFS</p>
                  </div>
                </div>

                {result.data.data?.qrCode && (
                  <div className="mb-6 p-6 bg-white rounded-xl shadow-lg">
                    <div className="text-center">
                      <h4 className="font-bold text-gray-800 mb-4 flex items-center justify-center gap-2">
                        <QrCode className="w-5 h-5" />
                        Certificate QR Code
                      </h4>
                      <img 
                        src={result.data.data.qrCode} 
                        alt="Certificate QR Code" 
                        className="mx-auto mb-4 border-4 border-gray-200 rounded-lg"
                        style={{ width: '256px', height: '256px' }}
                      />
                      <button
                        onClick={downloadQRCode}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-6 rounded-lg font-semibold flex items-center gap-2 mx-auto hover:shadow-lg transition-all"
                      >
                        <Download className="w-4 h-4" />
                        Download QR Code
                      </button>
                      <p className="text-xs text-gray-600 mt-3">
                        Use this QR code for quick verification
                      </p>
                    </div>
                  </div>
                )}

                <div className="bg-white/10 backdrop-blur-sm p-5 rounded-xl space-y-4 border border-white/20">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <span className="text-cyan-200 font-semibold">Certificate Hash:</span>
                    <span className="md:col-span-2 text-white font-mono text-xs break-all bg-black/20 px-3 py-2 rounded">
                      {result.data.data?.certificateHash || result.data.certificateHash}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <span className="text-cyan-200 font-semibold">IPFS CID:</span>
                    <span className="md:col-span-2 text-white font-mono text-xs break-all bg-black/20 px-3 py-2 rounded">
                      {result.data.data?.ipfsCID || result.data.ipfsCID}
                    </span>
                  </div>
                  {(result.data.data?.ipfsUrl || result.data.ipfsUrl) && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                      <span className="text-cyan-200 font-semibold">IPFS URL:</span>
                      <div className="md:col-span-2">
                        <button
                          onClick={() => downloadFromIPFS(result.data.data?.ipfsUrl || result.data.ipfsUrl, 'certificate.pdf')}
                          className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-4 rounded-lg font-semibold flex items-center gap-2 transition-all text-xs"
                        >
                          <Download className="w-3 h-3" />
                          Download from IPFS
                        </button>
                      </div>
                    </div>
                  )}
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
                    {result.data.verificationMethod && (
                      <p className={`text-xs mt-2 flex items-center gap-1 ${result.data.isValid ? 'text-green-300' : 'text-red-300'}`}>
                        {result.data.verificationMethod === 'QR Code' ? <QrCode className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
                        Verified via {result.data.verificationMethod}
                      </p>
                    )}
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
                    {result.data.ipfsCID && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                          <span className="text-cyan-200 font-semibold">IPFS CID:</span>
                          <span className="md:col-span-2 text-white font-mono text-xs break-all bg-black/20 px-3 py-2 rounded">
                            {result.data.ipfsCID}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                          <span className="text-cyan-200 font-semibold">Download:</span>
                          <div className="md:col-span-2">
                            <button
                              onClick={() => downloadFromIPFS(result.data.ipfsUrl, 'certificate.pdf')}
                              className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-4 rounded-lg font-semibold flex items-center gap-2 transition-all text-xs"
                            >
                              <Download className="w-3 h-3" />
                              Download from IPFS
                            </button>
                          </div>
                        </div>
                      </>
                    )}
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

            {result && result.type === 'revoke' && (
              <div className="mt-8 p-6 bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-400/50 rounded-xl backdrop-blur-sm">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <XCircle className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-orange-100 text-xl">Certificate Revoked Successfully!</h3>
                    <p className="text-orange-200 text-sm mt-1">Certificate has been permanently invalidated on blockchain</p>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm p-5 rounded-xl space-y-4 border border-white/20">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <span className="text-cyan-200 font-semibold">Certificate Hash:</span>
                    <span className="md:col-span-2 text-white font-mono text-xs break-all bg-black/20 px-3 py-2 rounded">
                      {result.data.certificateHash}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <span className="text-cyan-200 font-semibold">Transaction Hash:</span>
                    <span className="md:col-span-2 text-white font-mono text-xs break-all bg-black/20 px-3 py-2 rounded">
                      {result.data.transactionHash}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <span className="text-cyan-200 font-semibold">Block Number:</span>
                    <span className="md:col-span-2 text-white bg-black/20 px-3 py-2 rounded">
                      {result.data.blockNumber}
                    </span>
                  </div>
                  <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-4 mt-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-300 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-red-200">
                        <p className="font-semibold">This certificate is now invalid</p>
                        <p className="mt-1">Any verification attempts will show this certificate as revoked</p>
                      </div>
                    </div>
                  </div>
                </div>
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