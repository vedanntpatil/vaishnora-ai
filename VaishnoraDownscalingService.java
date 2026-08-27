package com.vaishnora.ai.service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

/**
 * VAISHNORA AI - Enterprise Java 17 Integration Service
 * Smart India Hackathon 2026 (Problem Statement ID: 26074)
 * 
 * Client service consuming Vaishnora AI Downscaler FastAPI endpoints.
 */
public class VaishnoraDownscalingService {

    private final HttpClient httpClient;
    private final String apiBaseUrl;

    public VaishnoraDownscalingService(String apiBaseUrl) {
        this.apiBaseUrl = apiBaseUrl != null ? apiBaseUrl : "http://localhost:8000";
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(5))
                .build();
    }

    /**
     * Java DTO Record matching JSON Output Contract
     */
    public record DownscaledMetrics(
        double rainfall_mm,
        double block_baseline_mm,
        double temperature_c,
        double confidence_score,
        String flood_risk_level
    ) {}

    public record AgroAdvisory(
        String status,
        String primary_action,
        String crop_warning,
        String local_language_text
    ) {}

    public record PanchayatWeatherResponse(
        String panchayat_id,
        String panchayat_name,
        String block_name,
        String district,
        DownscaledMetrics downscaled_metrics,
        AgroAdvisory agro_advisory
    ) {}

    /**
     * Fetches Panchayat micro-climate prediction from Python downscaling backend.
     */
    public String fetchPanchayatWeatherJson(String panchayatId) throws Exception {
        String endpoint = apiBaseUrl + "/api/v1/panchayat/" + panchayatId;
        
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(endpoint))
                .header("Accept", "application/json")
                .GET()
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() == 200) {
            return response.body();
        } else {
            throw new RuntimeException("Failed to fetch weather downscaling data. HTTP Status: " + response.statusCode());
        }
    }

    public static void main(String[] args) {
        System.out.println("VAISHNORA AI - Java 17 Service Client Initialized.");
        VaishnoraDownscalingService service = new VaishnoraDownscalingService("http://localhost:8000");
        try {
            System.out.println("Calling Vaishnora AI Downscaler Endpoint for Panchayat MH-PN-411046...");
            // String jsonResponse = service.fetchPanchayatWeatherJson("MH-PN-411046");
            // System.out.println("Received Response: " + jsonResponse);
        } catch (Exception e) {
            System.err.println("Execution Note: Ensure FastAPI server (server.py) is running on port 8000.");
        }
    }
}
