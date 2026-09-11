import React, { useState, useEffect } from 'react';
import { MapPin, Camera, UserCheck, FileText, CheckCircle2, Navigation, X } from 'lucide-react';
import MapContainer from '../../../components/Map/MapContainer';

export default function FieldOfficerDashboard() {
    const [tasks, setTasks] = useState([]);
    const [parcels, setParcels] = useState(null);
    const [selectedTask, setSelectedTask] = useState(null);
    const [isVerifying, setIsVerifying] = useState(false);
    
    // Form state for verification
    const [verificationData, setVerificationData] = useState({
        identityVerified: false,
        locationVerified: false,
        evidenceUploaded: false,
        notes: ''
    });

    useEffect(() => {
        const loadData = async () => {
            try {
                const response = await fetch('/api/parcels?page=1&limit=20', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                const data = await response.json();
                const actualTasks = (data.data?.items || data.items || data.data || []).map(p => ({
                    id: p.id,
                    ulpin: p.ulpin || p.dagNo || 'Unknown',
                    owner: p.ownerName || 'Unknown Owner',
                    status: 'Pending',
                    type: 'Field Verification',
                    lat: 26.14,
                    lng: 91.75
                }));
                setTasks(actualTasks);

                const geojson = {
                    type: "FeatureCollection",
                    features: actualTasks.map(t => ({
                        type: "Feature",
                        geometry: {
                            type: "Polygon",
                            coordinates: [[[t.lng - 0.001, t.lat - 0.001], [t.lng + 0.001, t.lat - 0.001], [t.lng + 0.001, t.lat + 0.001], [t.lng - 0.001, t.lat + 0.001], [t.lng - 0.001, t.lat - 0.001]]]
                        },
                        properties: { ulpin: t.ulpin, ...t }
                    }))
                };
                setParcels(geojson);

            } catch (err) {
                console.error("Failed to fetch parcels", err);
            }
        };
        loadData();
    }, []);

    const handleParcelSelect = (props) => {
        if (!props) return;
        const task = tasks.find(t => t.ulpin === props.ulpin);
        if (task) {
            setSelectedTask(task);
            setIsVerifying(false);
        }
    };

    const handleClose = () => {
        setSelectedTask(null);
        setIsVerifying(false);
    };

    const submitVerification = () => {
        // In reality, this would POST to /api/field-verification
        alert('Verification data submitted successfully!');
        
        // Update local status
        setTasks(tasks.map(t => t.id === selectedTask.id ? { ...t, status: 'Completed' } : t));
        
        // Reset and close
        setIsVerifying(false);
        setSelectedTask(null);
        setVerificationData({
            identityVerified: false,
            locationVerified: false,
            evidenceUploaded: false,
            notes: ''
        });
    };

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] md:flex-row bg-gray-100 overflow-hidden relative">
            {/* Map Area */}
            <div className="flex-1 relative z-0 h-full">
                <MapContainer 
                    parcels={parcels} 
                    onParcelSelect={handleParcelSelect} 
                    affectedParcels={parcels} 
                />
                
                {/* Floating summary on top for mobile */}
                <div className="absolute top-4 left-4 right-4 z-10 flex gap-3 pointer-events-none">
                   <div className="bg-white/95 backdrop-blur p-4 rounded-2xl shadow-lg flex-1 pointer-events-auto border border-gray-100">
                       <h3 className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Today's Tasks</h3>
                       <div className="flex items-baseline gap-2">
                           <p className="text-3xl font-black text-blue-900">{tasks.filter(t => t.status === 'Pending').length}</p>
                           <p className="text-sm font-semibold text-gray-400">pending</p>
                       </div>
                   </div>
                   <div className="bg-white/95 backdrop-blur p-4 rounded-2xl shadow-lg flex-1 pointer-events-auto border border-gray-100">
                       <h3 className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Completed</h3>
                       <div className="flex items-baseline gap-2">
                           <p className="text-3xl font-black text-green-600">{tasks.filter(t => t.status === 'Completed').length}</p>
                           <p className="text-sm font-semibold text-gray-400">done</p>
                       </div>
                   </div>
                </div>
            </div>

            {/* Bottom Sheet for Mobile, Right Panel for Desktop */}
            <div className={`
                absolute md:relative bottom-0 left-0 right-0 
                bg-white rounded-t-3xl md:rounded-none shadow-[0_-10px_40px_rgba(0,0,0,0.1)] md:shadow-none
                z-20 w-full md:w-[400px] flex flex-col transition-all duration-300 ease-in-out border-l border-gray-200
                ${selectedTask || isVerifying ? 'h-[85vh] md:h-full' : 'h-[40vh] md:h-full'}
            `}>
                {/* Handle bar for bottom sheet */}
                <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mt-4 mb-2 md:hidden" />

                <div className="flex-1 overflow-y-auto p-5 pb-safe">
                    {isVerifying && selectedTask ? (
                        // Verification View
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 pb-20">
                            {/* Header */}
                            <div className="flex items-center justify-between pb-4 border-b">
                                <h2 className="text-xl font-bold text-gray-900">Field Verification</h2>
                                <button onClick={() => setIsVerifying(false)} className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 active:bg-gray-300 transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl">
                                <p className="font-bold text-blue-900 text-lg">{selectedTask.ulpin}</p>
                                <p className="text-sm font-medium text-blue-800 mt-1">Owner: {selectedTask.owner}</p>
                            </div>

                            <div className="space-y-3">
                                <label className="flex items-start p-4 border-2 rounded-2xl cursor-pointer active:bg-gray-50 touch-manipulation transition-colors has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50/50">
                                    <input 
                                        type="checkbox" 
                                        className="w-6 h-6 mt-1 text-blue-600 rounded-md border-gray-300 focus:ring-blue-500" 
                                        checked={verificationData.identityVerified}
                                        onChange={(e) => setVerificationData({...verificationData, identityVerified: e.target.checked})}
                                    />
                                    <div className="ml-4">
                                        <span className="block font-bold text-gray-900 text-lg flex items-center gap-2"><UserCheck className="w-5 h-5 text-blue-600" /> Identity Verified</span>
                                        <span className="block text-sm font-medium text-gray-500 mt-1">Aadhaar/PAN matches owner records.</span>
                                    </div>
                                </label>

                                <label className="flex items-start p-4 border-2 rounded-2xl cursor-pointer active:bg-gray-50 touch-manipulation transition-colors has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50/50">
                                    <input 
                                        type="checkbox" 
                                        className="w-6 h-6 mt-1 text-blue-600 rounded-md border-gray-300 focus:ring-blue-500" 
                                        checked={verificationData.locationVerified}
                                        onChange={(e) => setVerificationData({...verificationData, locationVerified: e.target.checked})}
                                    />
                                    <div className="ml-4">
                                        <span className="block font-bold text-gray-900 text-lg flex items-center gap-2"><MapPin className="w-5 h-5 text-blue-600" /> Location Verified</span>
                                        <span className="block text-sm font-medium text-gray-500 mt-1">GPS coordinates match parcel bounds.</span>
                                    </div>
                                </label>

                                <label className="flex items-start p-4 border-2 rounded-2xl cursor-pointer active:bg-gray-50 touch-manipulation transition-colors has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50/50">
                                    <input 
                                        type="checkbox" 
                                        className="w-6 h-6 mt-1 text-blue-600 rounded-md border-gray-300 focus:ring-blue-500" 
                                        checked={verificationData.evidenceUploaded}
                                        onChange={(e) => setVerificationData({...verificationData, evidenceUploaded: e.target.checked})}
                                    />
                                    <div className="ml-4">
                                        <span className="block font-bold text-gray-900 text-lg flex items-center gap-2"><Camera className="w-5 h-5 text-blue-600" /> Evidence Uploaded</span>
                                        <span className="block text-sm font-medium text-gray-500 mt-1">Photos of land and owner captured.</span>
                                    </div>
                                </label>

                                <div className="pt-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-2 pl-1">Additional Notes</label>
                                    <textarea 
                                        className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 touch-manipulation text-base transition-all resize-none"
                                        placeholder="Enter any discrepancies or remarks..."
                                        rows="3"
                                        value={verificationData.notes}
                                        onChange={(e) => setVerificationData({...verificationData, notes: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="mt-8">
                                <button 
                                    className="w-full py-4 bg-blue-600 text-white font-bold text-lg rounded-2xl hover:bg-blue-700 active:bg-blue-800 active:scale-[0.98] transition-all touch-manipulation flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 disabled:opacity-50 disabled:active:scale-100"
                                    onClick={submitVerification}
                                    disabled={!verificationData.identityVerified || !verificationData.locationVerified || !verificationData.evidenceUploaded}
                                >
                                    <CheckCircle2 className="w-6 h-6" /> Submit Verification
                                </button>
                            </div>
                        </div>
                    ) : selectedTask ? (
                        // Task Detail View
                        <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300 pb-10">
                            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                                <h2 className="text-xl font-bold text-gray-900">Task Details</h2>
                                <button onClick={handleClose} className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 active:bg-gray-300 transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            
                            <div className="bg-white border-2 border-gray-100 rounded-3xl p-5 shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-2xl font-black text-gray-900">{selectedTask.ulpin}</h3>
                                        <p className="text-sm font-bold text-gray-500 mt-1 uppercase tracking-wider">{selectedTask.type}</p>
                                    </div>
                                    <span className={`px-3 py-1.5 rounded-full text-sm font-bold ${selectedTask.status === 'Pending' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
                                        {selectedTask.status}
                                    </span>
                                </div>
                                <div className="space-y-4 pt-4 border-t border-gray-100">
                                    <div>
                                        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Owner</p>
                                        <p className="font-semibold text-gray-900 text-lg">{selectedTask.owner}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Location</p>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-gray-400" />
                                            <p className="font-semibold text-gray-700">{selectedTask.lat}, {selectedTask.lng}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                <button className="flex-1 py-4 bg-gray-100 text-gray-800 font-bold text-lg rounded-2xl hover:bg-gray-200 active:bg-gray-300 active:scale-[0.98] transition-all touch-manipulation flex items-center justify-center gap-2">
                                    <Navigation className="w-5 h-5" /> Navigate
                                </button>
                                <button 
                                    className="flex-1 py-4 bg-blue-600 text-white font-bold text-lg rounded-2xl hover:bg-blue-700 active:bg-blue-800 active:scale-[0.98] transition-all touch-manipulation flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 disabled:opacity-50 disabled:shadow-none disabled:active:scale-100"
                                    onClick={() => setIsVerifying(true)}
                                    disabled={selectedTask.status === 'Completed'}
                                >
                                    <FileText className="w-5 h-5" /> {selectedTask.status === 'Completed' ? 'Verified' : 'Verify Now'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        // Task List View
                        <div className="pb-10">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 px-1">Assigned Parcels</h2>
                            <div className="space-y-3">
                                {tasks.map(task => (
                                    <div 
                                        key={task.id} 
                                        onClick={() => setSelectedTask(task)}
                                        className="p-5 bg-white border-2 border-gray-100 rounded-3xl shadow-sm hover:shadow-md hover:border-blue-100 active:bg-gray-50 active:scale-[0.99] cursor-pointer touch-manipulation transition-all"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-gray-900 text-lg">{task.ulpin}</h3>
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${task.status === 'Pending' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
                                                {task.status}
                                            </span>
                                        </div>
                                        <p className="text-sm font-semibold text-gray-500">{task.type}</p>
                                        <div className="mt-3 flex items-center justify-between">
                                            <p className="text-sm font-bold text-gray-700">{task.owner}</p>
                                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                                                <MapPin className="w-4 h-4 text-gray-400" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
