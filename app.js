/**
 * VAISHNORA AI - Smart India Hackathon 2026 (PS ID: 26074)
 * Client-side GIS Map Engine, Downscaling Simulator, and Bhashini Voice SMS Integration
 */

document.addEventListener('DOMContentLoaded', () => {
  // State Initialization
  const state = {
    district: "Pune",
    block: "Haveli",
    panchayatId: "MH-PN-411046",
    panchayatName: "Ambegaon BK",
    engine: "Physics-XGBoost",
    coarseRain: 28.0,
    coarseTemp: 30.5,
    elevationDelta: 450,
    twi: 11.4,
    currentLang: "en"
  };

  // Multilingual Dictionary (Bhashini API Mockup)
  const translations = {
    en: {
      action: "Delay Irrigation & Clear Drainage Outlets",
      crop: "High risk of root rot for standing crops.",
      text: "Drainage Alert for Ambegaon BK: Heavy micro-flood accumulation expected in low-lying survey plots within 6 hours. Delay irrigation and clear drainage outlets immediately."
    },
    hi: {
      action: "सिंचाई में देरी करें और जल निकासी के रास्ते साफ करें",
      crop: "खड़ी फसलों के लिए जड़ सड़न का अत्यधिक जोखिम।",
      text: "अंबेगांव बीके के लिए जलभराव अलर्ट: अगले 6 घंटों में निचले खेतों में भारी पानी जमा होने की संभावना है। तुरंत सिंचाई रोकें और जल निकासी के चैनल खोलें।"
    },
    mr: {
      action: "सिंचन थांबवा आणि पाण्याचा निचरा करणारे मार्ग मोकळे करा",
      crop: "उभ्या पिकांसाठी मूळ कुजण्याचा मोठा धोका.",
      text: "आंबेगाव बीके साठी पाण्याचा निचरा इशारा: पुढील ६ तासांत सखल भागात मोठ्या प्रमाणात पाणी साचण्याची शक्यता आहे. सिंचन तातडीने थांबवा."
    },
    kn: {
      action: "ನೀರಾವರಿಯನ್ನು ವಿಳಂಬಗೊಳಿಸಿ ಮತ್ತು ಒಳಚರಂಡಿ ನಾಲೆಯನ್ನು ಸ್ವಚ್ಛಗೊಳಿಸಿ",
      crop: "ಬೆಳೆಗಳ ಬೇರು ಕೊಳೆಯುವ ಹೆಚ್ಚಿನ ಅಪಾಯ.",
      text: "ಅಂಬೇಗಾಂವ್ ಬಿಕೆ ಗೆ ಜಲಾವೃತ ಎಚ್ಚರಿಕೆ: ಮುಂದಿನ 6 ಗಂಟೆಗಳಲ್ಲಿ ತಗ್ಗು ಪ್ರದೇಶಗಳಲ್ಲಿ ಭಾರಿ ನೀರು ಸಂಗ್ರಹವಾಗುವ ಸಾಧ್ಯತೆಯಿದೆ."
    }
  };

  // Initialize GIS Map (Leaflet)
  const map = L.map('map').setView([18.4503, 73.8340], 12);

  // Dark Map Tiles
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://carto.com/">CARTO</a> | Vaishnora AI',
    maxZoom: 18,
    subdomains: 'abcd'
  }).addTo(map);

  // Gram Panchayat Polygons Simulation Data (Pune Haveli Block)
  const panchayatGrids = [
    {
      id: "MH-PN-411046",
      name: "Ambegaon BK",
      coords: [
        [18.4550, 73.8300],
        [18.4650, 73.8300],
        [18.4650, 73.8450],
        [18.4550, 73.8450]
      ],
      elev: 450,
      twi: 11.4
    },
    {
      id: "MH-PN-412205",
      name: "Khed Shivapur",
      coords: [
        [18.4350, 73.8200],
        [18.4480, 73.8200],
        [18.4480, 73.8380],
        [18.4350, 73.8380]
      ],
      elev: 620,
      twi: 14.2
    },
    {
      id: "MH-PN-411041",
      name: "Dhayari",
      coords: [
        [18.4400, 73.8000],
        [18.4550, 73.8000],
        [18.4550, 73.8180],
        [18.4400, 73.8180]
      ],
      elev: 380,
      twi: 8.5
    },
    {
      id: "MH-PN-411043",
      name: "Narhe",
      coords: [
        [18.4580, 73.8150],
        [18.4700, 73.8150],
        [18.4700, 73.8290],
        [18.4580, 73.8290]
      ],
      elev: 410,
      twi: 9.8
    }
  ];

  // Draw 12km Block Coarse Boundary (Dashed Rectangle)
  const blockBounds = [
    [18.4200, 73.7800],
    [18.4850, 73.8600]
  ];
  L.rectangle(blockBounds, {
    color: "#00f2fe",
    weight: 2,
    dashArray: "6, 8",
    fillOpacity: 0.05
  }).addTo(map).bindTooltip("Coarse IMD GFS Grid (12km x 12km Block)", { permanent: true, direction: "top" });

  let polygonLayers = [];

  function renderMapGrids(rainfallMetrics) {
    // Clear old layers
    polygonLayers.forEach(l => map.removeLayer(l));
    polygonLayers = [];

    panchayatGrids.forEach(p => {
      // Determine color based on risk
      const rainMult = (p.twi / 10.0);
      const localRain = (state.coarseRain * rainMult).toFixed(1);
      
      let fillColor = "#10b981"; // Low risk green
      if (localRain > 50) fillColor = "#ef4444"; // High risk red
      else if (localRain > 30) fillColor = "#f59e0b"; // Warning amber

      const poly = L.polygon(p.coords, {
        color: p.id === state.panchayatId ? "#00f2fe" : "rgba(255,255,255,0.4)",
        weight: p.id === state.panchayatId ? 3 : 1,
        fillColor: fillColor,
        fillOpacity: 0.45
      }).addTo(map);

      poly.bindPopup(`
        <div style="color: #000; font-family: sans-serif;">
          <strong>${p.name}</strong> (${p.id})<br/>
          Elevation: ${p.elev}m | TWI: ${p.twi}<br/>
          Downscaled Rain: <strong>${localRain} mm</strong>
        </div>
      `);

      poly.on('click', () => {
        document.getElementById('panchayatSelect').value = p.id;
        state.panchayatId = p.id;
        state.panchayatName = p.name;
        state.elevationDelta = p.elev;
        state.twi = p.twi;
        document.getElementById('elevationSlider').value = p.elev;
        document.getElementById('twiSlider').value = p.twi;
        updateDownscalingCalculation();
      });

      polygonLayers.push(poly);
    });
  }

  // Live Physics-Conditioned Downscaling Calculation
  function updateDownscalingCalculation() {
    // Atmospheric Lapse Rate: -0.0065 °C per meter elevation change
    const lapseRate = -0.0065;
    const tempAdjustment = state.elevationDelta * lapseRate;
    const downscaledTemp = (state.coarseTemp + tempAdjustment).toFixed(1);

    // Rainfall downscaling based on Topographic Wetness Index & slope accumulation
    const rainMultiplier = 1.0 + (state.twi - 10.0) * 0.12;
    const downscaledRain = (state.coarseRain * Math.max(0.4, rainMultiplier)).toFixed(1);

    // Flood Risk Classification
    let riskLevel = "LOW";
    let riskClass = "LOW";
    let riskIcon = "✅";
    if (downscaledRain > 50.0) {
      riskLevel = "HIGH";
      riskClass = "HIGH";
      riskIcon = "🚨";
    } else if (downscaledRain > 30.0) {
      riskLevel = "WARNING";
      riskClass = "WARNING";
      riskIcon = "⚠️";
    }

    const confidenceScore = (0.85 + Math.random() * 0.08).toFixed(2);

    // Update Advisory UI Card
    const advisoryCard = document.getElementById('advisoryCard');
    advisoryCard.className = `advisory-card ${riskClass}`;
    document.getElementById('alertIcon').textContent = riskIcon;
    document.getElementById('alertLevel').textContent = `${riskLevel} MICRO-FLOOD RISK ALERT`;

    const langData = translations[state.currentLang];
    document.getElementById('alertText').textContent = `Primary Action: ${langData.action}. ${langData.crop}`;

    // Generate Output JSON Schema Matching Specification Contract
    const outputContract = {
      "panchayat_id": state.panchayatId,
      "panchayat_name": state.panchayatName,
      "block_name": state.block,
      "district": state.district,
      "downscaled_metrics": {
        "rainfall_mm": parseFloat(downscaledRain),
        "block_baseline_mm": parseFloat(state.coarseRain),
        "temperature_c": parseFloat(downscaledTemp),
        "confidence_score": parseFloat(confidenceScore),
        "flood_risk_level": riskLevel
      },
      "agro_advisory": {
        "status": riskLevel === "HIGH" ? "ACTION_REQUIRED" : "MONITOR",
        "primary_action": langData.action,
        "crop_warning": langData.crop,
        "local_language_text": langData.text
      }
    };

    // Render formatted JSON in Code Viewer
    document.getElementById('jsonOutput').textContent = JSON.stringify(outputContract, null, 2);

    // Update Map
    renderMapGrids(downscaledRain);
  }

  // Event Listeners for Controls & Sliders
  document.getElementById('coarseRainSlider').addEventListener('input', (e) => {
    state.coarseRain = parseFloat(e.target.value);
    document.getElementById('coarseRainVal').textContent = `${state.coarseRain.toFixed(1)} mm`;
    updateDownscalingCalculation();
  });

  document.getElementById('coarseTempSlider').addEventListener('input', (e) => {
    state.coarseTemp = parseFloat(e.target.value);
    document.getElementById('coarseTempVal').textContent = `${state.coarseTemp.toFixed(1)} °C`;
    updateDownscalingCalculation();
  });

  document.getElementById('elevationSlider').addEventListener('input', (e) => {
    state.elevationDelta = parseInt(e.target.value);
    document.getElementById('elevationVal').textContent = `+${state.elevationDelta} m`;
    updateDownscalingCalculation();
  });

  document.getElementById('twiSlider').addEventListener('input', (e) => {
    state.twi = parseFloat(e.target.value);
    document.getElementById('twiVal').textContent = state.twi.toFixed(1);
    updateDownscalingCalculation();
  });

  document.getElementById('panchayatSelect').addEventListener('change', (e) => {
    state.panchayatId = e.target.value;
    const selected = panchayatGrids.find(p => p.id === state.panchayatId);
    if (selected) {
      state.panchayatName = selected.name;
      state.elevationDelta = selected.elev;
      state.twi = selected.twi;
      document.getElementById('elevationSlider').value = selected.elev;
      document.getElementById('twiSlider').value = selected.twi;
      document.getElementById('elevationVal').textContent = `+${selected.elev} m`;
      document.getElementById('twiVal').textContent = selected.twi.toFixed(1);
    }
    updateDownscalingCalculation();
  });

  // Language Switcher Function
  window.switchLang = function(lang) {
    state.currentLang = lang;
    document.querySelectorAll('.lang-pill').forEach(btn => {
      btn.classList.remove('active');
    });
    event.target.classList.add('active');
    updateDownscalingCalculation();
  };

  // Bhashini Voice SMS Telephony Audio Simulation (Web Speech API)
  document.getElementById('btnPlayVoice').addEventListener('click', () => {
    const textToSpeak = translations[state.currentLang].text;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop ongoing speech
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      
      // Set language codes for Speech Synthesis
      if (state.currentLang === 'hi') utterance.lang = 'hi-IN';
      else if (state.currentLang === 'mr') utterance.lang = 'mr-IN';
      else if (state.currentLang === 'kn') utterance.lang = 'kn-IN';
      else utterance.lang = 'en-IN';

      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
      
      const btn = document.getElementById('btnPlayVoice');
      btn.innerHTML = '<span>🔊 Playing Audio...</span>';
      utterance.onend = () => {
        btn.innerHTML = '<span>▶ Play Voice SMS</span>';
      };
    } else {
      alert("Voice SMS Synthesis Audio:\n\n" + textToSpeak);
    }
  });

  // Initial Calculation Run
  updateDownscalingCalculation();
});
