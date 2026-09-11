import React, { useState } from 'react';
import { Search, MapPin, FileText, IndianRupee, Home, Bell, AlertCircle, Loader2, Calendar } from 'lucide-react';

export default function CitizenPortal() {
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) return;

    setLoading(true);
    setError('');
    setData(null);

    try {
      const response = await fetch(`/api/citizen/parcel/${identifier}/status`);
      if (!response.ok) {
        throw new Error('Parcel not found. Please check your Dag/ULPIN and try again.');
      }
      const result = await response.json();
      setData(result.data || result);
    } catch (err) {
      setError(err.message || 'Failed to fetch status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 md:bg-gray-100 p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Header / Search */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Citizen Portal</h1>
            <p className="text-gray-500 mt-2">Track your land acquisition status using Dag No. or ULPIN</p>
          </div>

          <form onSubmit={handleSearch} className="relative">
            <div className="flex items-center bg-gray-50 rounded-xl border border-gray-200 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
              <div className="pl-4">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Enter Dag No. or ULPIN..."
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full py-3 px-4 bg-transparent outline-none text-gray-900"
                required
              />
              <button
                type="submit"
                disabled={loading || !identifier.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Search'}
              </button>
            </div>
          </form>
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}
        </div>

        {/* Results */}
        {data && (
          <div className="space-y-4">
            
            {/* Parcel Details */}
            {data.parcel && (
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-4 border-b pb-4">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">Parcel Information</h2>
                    <p className="text-sm text-gray-500">Basic details of your land</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">ULPIN</p>
                    <p className="font-medium">{data.parcel.ulpin || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Dag No</p>
                    <p className="font-medium">{data.parcel.dagNo || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Area</p>
                    <p className="font-medium">{data.parcel.area || 'N/A'} {data.parcel.unit || 'sq.m'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Stage</p>
                    <span className="inline-block px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-medium mt-1">
                      {data.parcel.currentStage || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Compensation */}
            {data.compensation && (
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-4 border-b pb-4">
                  <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                    <IndianRupee className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">Compensation</h2>
                    <p className="text-sm text-gray-500">Award and payment status</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Award</span>
                    <span className="font-semibold text-lg">₹{data.compensation.totalAward?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Disbursed</span>
                    <span className="font-medium text-green-600">₹{data.compensation.amountDisbursed?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Status</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      data.compensation.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' :
                      data.compensation.paymentStatus === 'PROCESSING' ? 'bg-blue-100 text-blue-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {data.compensation.paymentStatus || 'PENDING'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* R&R (Rehabilitation & Resettlement) */}
            {data.rr && (
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-4 border-b pb-4">
                  <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                    <Home className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">Rehabilitation & Resettlement</h2>
                    <p className="text-sm text-gray-500">R&R assistance details</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Eligibility</span>
                    <span className="font-medium">{data.rr.isEligible ? 'Eligible' : 'Not Eligible'}</span>
                  </div>
                  {data.rr.isEligible && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Entitlement</span>
                        <span className="font-medium">{data.rr.entitlementType || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Status</span>
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">
                          {data.rr.status || 'PENDING'}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Documents */}
            {data.documents && data.documents.length > 0 && (
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-4 border-b pb-4">
                  <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">Documents</h2>
                    <p className="text-sm text-gray-500">Related files and notices</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {data.documents.map((doc, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">{doc.name || doc.documentType || 'Document'}</span>
                      </div>
                      <span className="text-xs px-2 py-1 bg-white border border-gray-200 rounded text-gray-600">
                        {doc.status || 'Uploaded'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notifications */}
            {data.notifications && data.notifications.length > 0 && (
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-4 border-b pb-4">
                  <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg">
                    <Bell className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">Notifications</h2>
                    <p className="text-sm text-gray-500">Recent updates on your parcel</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {data.notifications.map((notif, idx) => (
                    <div key={idx} className="flex gap-3 items-start">
                      <div className="mt-1">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-800">{notif.message || notif.title}</p>
                        {notif.date && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(notif.date).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
