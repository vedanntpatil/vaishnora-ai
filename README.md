# VAISHNORA AI (SIH-2026-26074)
## Block to Gram Panchayat Weather Downscaling Engine

This directory contains the full multi-language software architecture for Vaishnora AI:
- **CSS**: `styles.css` (Glassmorphism dark geospatial design system)
- **Frontend / JavaScript**: `index.html` + `app.js` (Interactive 3D Digital Twin GIS dashboard with Bhashini Voice SMS tele-audio player and live JSON inspector)
- **Backend / Python**: `server.py` + `downscaler_engine.py` (FastAPI REST API, PyTorch PINN model, Celery+Redis task queue, PostGIS 3.3 schema)
- **Enterprise Java**: `VaishnoraDownscalingService.java` (Java 17 DTO records & HTTP Client)

### How to Run the Web Dashboard
1. Open `index.html` directly in your browser.
2. Interact with the district/block/panchayat selectors and live simulation sliders (Rain, Temp, Elevation, TWI).
3. Click **"Play Voice SMS"** to hear Bhashini multilingual audio alerts spoken in English, Hindi, Marathi, or Kannada.

### How to Run the Python FastAPI Backend
```bash
pip install fastapi uvicorn pydantic celert redis torch xgboost geopandas rasterio
python server.py
```
Open `http://localhost:8000/docs` in your browser for the swagger API documentation.
"# vaishnora-ai" 
"# vaishnora-ai" 
