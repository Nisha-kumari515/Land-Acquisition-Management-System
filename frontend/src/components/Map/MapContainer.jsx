import React, { useEffect, useRef, useState } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import XYZ from 'ol/source/XYZ';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { Style, Stroke, Fill, Circle as CircleStyle } from 'ol/style';
import { transformExtent } from 'ol/proj';
import Draw from 'ol/interaction/Draw';

// BHOOMISETU COLORS
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

const riskStyle = new Style({
    stroke: new Stroke({ color: '#F59E0B', width: 2 }),
    fill: new Fill({ color: 'rgba(245, 158, 11, 0.4)' })
});

export default function MapContainer({ 
    parcels, projects, affectedParcels, riskParcels,
    onParcelSelect, isDrawing, onDrawingComplete,
    layersVisible = { cadastral: true, project: true, affected: true, risk: true }
}) {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const vectorSourceRef = useRef(new VectorSource());
    const drawInteractionRef = useRef(null);
    
    // Layers
    const parcelSourceRef = useRef(new VectorSource());
    const projectSourceRef = useRef(new VectorSource());
    const affectedSourceRef = useRef(new VectorSource());
    const riskSourceRef = useRef(new VectorSource());
    
    const parcelLayerRef = useRef(new VectorLayer({ source: parcelSourceRef.current, style: parcelStyle, zIndex: 1 }));
    const projectLayerRef = useRef(new VectorLayer({ source: projectSourceRef.current, style: projectStyle, zIndex: 3 }));
    const affectedLayerRef = useRef(new VectorLayer({ source: affectedSourceRef.current, style: affectedStyle, zIndex: 2 }));
    const riskLayerRef = useRef(new VectorLayer({ source: riskSourceRef.current, style: riskStyle, zIndex: 4 }));

    const [mapReady, setMapReady] = useState(false);

    useEffect(() => {
        if (!mapRef.current || mapInstance.current) return;

        const assamExtent = transformExtent([89.68, 24.13, 96.01, 27.97], 'EPSG:4326', 'EPSG:3857');

        const map = new Map({
            target: mapRef.current,
            layers: [
                new TileLayer({ 
                    source: new XYZ({ url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', maxZoom: 19 }) 
                }),
                new TileLayer({ 
                    source: new OSM(),
                    opacity: 0.4
                }),
                parcelLayerRef.current,
                affectedLayerRef.current,
                projectLayerRef.current,
                riskLayerRef.current,
                new VectorLayer({ source: vectorSourceRef.current, zIndex: 10 }) // Draw layer
            ],
            view: new View({
                center: [10214697, 2983792], // Kamrup approx
                zoom: 12,
                extent: assamExtent, // Restrict to Assam
                minZoom: 6
            })
        });

        map.on('click', (e) => {
            if (isDrawing) return;
            const features = map.getFeaturesAtPixel(e.pixel);
            if (features && features.length > 0) {
                const feature = features.find(f => f.get('ulpin') || f.get('dagNo') || f.get('id'));
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

    // Update Features
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

        riskSourceRef.current.clear();
        if (riskParcels?.features) {
            riskSourceRef.current.addFeatures(format.readFeatures(riskParcels, {
                featureProjection: 'EPSG:3857',
                dataProjection: 'EPSG:4326'
            }));
        }
    }, [parcels, projects, affectedParcels, riskParcels, mapReady]);

    // Layer Visibility
    useEffect(() => {
        if (!mapReady) return;
        parcelLayerRef.current.setVisible(layersVisible.cadastral !== false);
        projectLayerRef.current.setVisible(layersVisible.project !== false);
        affectedLayerRef.current.setVisible(layersVisible.affected !== false);
        riskLayerRef.current.setVisible(layersVisible.risk !== false);
    }, [layersVisible, mapReady]);

    return (
        <div ref={mapRef} style={{ width: '100%', height: '100%', minHeight: '500px', background: '#e5e5e5' }} />
    );
}
