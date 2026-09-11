import React, { useEffect, useRef, useState } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { Style, Stroke, Fill, Circle as CircleStyle } from 'ol/style';
import { transformExtent } from 'ol/proj';
import Draw from 'ol/interaction/Draw';

// BHOOMISETU COLORS
// Brand: #1E3A8A (blue)
// Accent: #F59E0B (amber)
// Affected: #EF4444 (red)
// Default Parcel: #E5E7EB (gray)

const parcelStyle = new Style({
    stroke: new Stroke({ color: 'rgba(107, 114, 128, 0.5)', width: 1 }),
    fill: new Fill({ color: 'rgba(243, 244, 246, 0.1)' })
});

const affectedStyle = new Style({
    stroke: new Stroke({ color: '#EF4444', width: 2 }),
    fill: new Fill({ color: 'rgba(239, 68, 68, 0.2)' })
});

const projectStyle = new Style({
    stroke: new Stroke({ color: '#3B82F6', width: 3, lineDash: [10, 10] }),
    fill: new Fill({ color: 'rgba(59, 130, 246, 0.1)' })
});

const selectedStyle = new Style({
    stroke: new Stroke({ color: '#F59E0B', width: 3 }),
    fill: new Fill({ color: 'rgba(245, 158, 11, 0.3)' })
});

export default function MapContainer({ 
    parcels, projects, affectedParcels, 
    onParcelSelect, isDrawing, onDrawingComplete 
}) {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const vectorSourceRef = useRef(new VectorSource());
    const drawInteractionRef = useRef(null);
    
    // Layers
    const parcelSourceRef = useRef(new VectorSource());
    const projectSourceRef = useRef(new VectorSource());
    const affectedSourceRef = useRef(new VectorSource());
    const [mapReady, setMapReady] = useState(false);

    useEffect(() => {
        if (!mapRef.current || mapInstance.current) return;

        // Initialize map
        const map = new Map({
            target: mapRef.current,
            layers: [
                new TileLayer({ source: new OSM() }),
                new VectorLayer({ source: parcelSourceRef.current, style: parcelStyle, zIndex: 1 }),
                new VectorLayer({ source: projectSourceRef.current, style: projectStyle, zIndex: 3 }),
                new VectorLayer({ source: affectedSourceRef.current, style: affectedStyle, zIndex: 2 }),
                new VectorLayer({ source: vectorSourceRef.current, zIndex: 10 }) // Draw layer
            ],
            view: new View({
                center: [10214697, 2983792], // Approx Assam WGS84 Web Mercator
                zoom: 12
            })
        });

        map.on('click', (e) => {
            if (isDrawing) return;
            const features = map.getFeaturesAtPixel(e.pixel);
            if (features && features.length > 0) {
                const feature = features.find(f => f.get('ulpin') || f.get('dagNo')); // It's a parcel
                if (feature) {
                    onParcelSelect(feature.getProperties());
                }
            } else {
                onParcelSelect(null);
            }
        });

        mapInstance.current = map;
        setMapReady(true);

        return () => {
            map.setTarget(null);
            mapInstance.current = null;
        };
    }, []);

    // Handle Drawing
    useEffect(() => {
        if (!mapInstance.current) return;

        if (isDrawing) {
            if (drawInteractionRef.current) {
                mapInstance.current.removeInteraction(drawInteractionRef.current);
            }
            
            const draw = new Draw({
                source: vectorSourceRef.current,
                type: 'Polygon'
            });

            draw.on('drawend', (e) => {
                const geojson = new GeoJSON().writeFeatureObject(e.feature, {
                    featureProjection: 'EPSG:3857',
                    dataProjection: 'EPSG:4326'
                });
                onDrawingComplete(geojson);
            });

            mapInstance.current.addInteraction(draw);
            drawInteractionRef.current = draw;
        } else {
            if (drawInteractionRef.current) {
                mapInstance.current.removeInteraction(drawInteractionRef.current);
                drawInteractionRef.current = null;
            }
        }
    }, [isDrawing, onDrawingComplete]);

    // Update Features (Parcels, Projects)
    useEffect(() => {
        if (!mapReady) return;
        
        const format = new GeoJSON();
        
        parcelSourceRef.current.clear();
        if (parcels?.features) {
            parcelSourceRef.current.addFeatures(format.readFeatures(parcels, {
                featureProjection: 'EPSG:3857',
                dataProjection: 'EPSG:4326'
            }));
        }

        projectSourceRef.current.clear();
        if (projects?.features) {
            projectSourceRef.current.addFeatures(format.readFeatures(projects, {
                featureProjection: 'EPSG:3857',
                dataProjection: 'EPSG:4326'
            }));
        }

        affectedSourceRef.current.clear();
        if (affectedParcels?.features) {
            affectedSourceRef.current.addFeatures(format.readFeatures(affectedParcels, {
                featureProjection: 'EPSG:3857',
                dataProjection: 'EPSG:4326'
            }));
        }

    }, [parcels, projects, affectedParcels, mapReady]);

    // Fit view to bounds
    useEffect(() => {
        if (!mapReady || (!parcels?.features?.length && !projects?.features?.length)) return;
        
        // Wait briefly for features to load properly before fitting
        setTimeout(() => {
            if (!mapInstance.current) return;
            const extent = projectSourceRef.current.getExtent();
            if (extent && extent[0] !== Infinity) {
                mapInstance.current.getView().fit(extent, { padding: [50, 50, 50, 50], maxZoom: 16 });
            }
        }, 300);
    }, [projects, mapReady]);

    return (
        <div ref={mapRef} style={{ width: '100%', height: '100%', minHeight: '500px', background: '#e5e5e5' }} />
    );
}
