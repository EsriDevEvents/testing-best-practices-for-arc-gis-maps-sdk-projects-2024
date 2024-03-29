import React, { useRef, useEffect } from "react";
import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Graphic from "@arcgis/core/Graphic";
import SimpleMarkerSymbol from "@arcgis/core/symbols/SimpleMarkerSymbol";
import Point from "@arcgis/core/geometry/Point";
import "@arcgis/core/assets/esri/themes/light/main.css";
import "./MapContainer.css";

// Set up map, mapview, and layers outside the React object so that
// they don't get recreated on re-renders
const map = new Map({
    basemap: "topo-vector"
});

const view = new MapView({
    map: map,
    zoom: 8,
    center: [-117, 34]
});

const pinLayer = new GraphicsLayer();

map.add(pinLayer);

const pointLayer = new GraphicsLayer();

map.add(pointLayer);

/**
 * Component that controls interactions with the map.
 *  
 * @param {Object} param0 React parameters passed to the object
 * @param {Function} param0.onMapLoad Called when the map is loaded
 * @param {Function} param0.onMapClick Called when the map is clicked
 * @param {Array<Object>} param0.loadedPoints points loaded from the server
 */
function MapContainer({ onMapLoad, onMapClick, loadedPoints }) {

    const mapDiv = useRef(null);

    // Handle a click on the map
    useEffect(() => {
        view.on("click", (event) => {
            
            // Determine if user clicked on a point graphic or a blank area...
            view.hitTest(event, {include: [pointLayer]}).then(hits => {
                if (hits.results.length === 0) {

                    // Add a pointer to the map
                    pinLayer.removeAll();

                    const pinGraphic = new Graphic({
                        geometry: new Point({ latitude: event.mapPoint.latitude, longitude: event.mapPoint.longitude }),
                        symbol: new SimpleMarkerSymbol({ style: "x", size: 10, outline: { width: 3 } })
                    });

                    pinLayer.add(pinGraphic);

                    // Call event handler
                    onMapClick(event.mapPoint);
                }
            })
        });
    }, [onMapClick]);

    // Load observations to the map
    useEffect(() => {
        pointLayer.removeAll();
        loadedPoints.forEach((pt) => {
            const ptGraphic = new Graphic({
                geometry: new Point({ latitude: pt.latitude, longitude: pt.longitude }),
                symbol: new SimpleMarkerSymbol({ style: "circle", size: 10, outline: { width: 1 } }),
                attributes: {
                    observation: pt.observation
                },
                popupTemplate: {
                    "title": "{observation}"
                }
            });

            pointLayer.add(ptGraphic);
        });
        pinLayer.removeAll();
    }, [loadedPoints]);

    // Notify when map finishes loading
    useEffect(() => {
        view.container = mapDiv.current;

        view.when(() => {
            onMapLoad();
        });
    }, [onMapLoad]);

    return <div className="mapDiv" ref={mapDiv}></div>
}

export default MapContainer;