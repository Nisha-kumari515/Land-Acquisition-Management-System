import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { fetchApi } from '../../lib/api';

export default function GlobalSearch() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!query.trim()) {
            setResults(null);
            return;
        }

        const timer = setTimeout(() => {
            setLoading(true);
            fetchApi(`/search?q=${encodeURIComponent(query)}`)
                .then(setResults)
                .catch(console.error)
                .finally(() => setLoading(false));
        }, 500);

        return () => clearTimeout(timer);
    }, [query]);

    return (
        <div className="global-search-container">
            <div className="search-input-wrapper">
                <Search size={16} className="search-icon" />
                <input 
                    type="text" 
                    placeholder="Search projects, parcels, owners..." 
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    className="global-search-input"
                />
            </div>
            
            {isOpen && query && (
                <div className="search-results-dropdown">
                    {loading ? (
                        <div className="p-4 text-center">Searching...</div>
                    ) : results ? (
                        <>
                            {results.projects?.length > 0 && (
                                <div className="result-group">
                                    <div className="result-group-title">Projects</div>
                                    {results.projects.map(p => (
                                        <div key={p.id} className="result-item">
                                            <strong>{p.name}</strong>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {results.parcels?.length > 0 && (
                                <div className="result-group">
                                    <div className="result-group-title">Parcels</div>
                                    {results.parcels.map(p => (
                                        <div key={p.id} className="result-item">
                                            <strong>Dag No. {p.dagNo}</strong> - {p.village}
                                        </div>
                                    ))}
                                </div>
                            )}
                            {results.owners?.length > 0 && (
                                <div className="result-group">
                                    <div className="result-group-title">Owners</div>
                                    {results.owners.map(o => (
                                        <div key={o.id} className="result-item">
                                            <strong>{o.ownerName}</strong>
                                        </div>
                                    ))}
                                </div>
                            )}
                            
                            {(!results.projects?.length && !results.parcels?.length && !results.owners?.length) && (
                                <div className="p-4 text-center text-sm">No results found for "{query}"</div>
                            )}
                        </>
                    ) : null}
                </div>
            )}
            
            {isOpen && <div className="search-backdrop" onClick={() => setIsOpen(false)} />}
        </div>
    );
}
