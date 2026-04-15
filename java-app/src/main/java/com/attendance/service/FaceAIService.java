package com.attendance.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.HashMap;
import java.util.Map;

@Service
public class FaceAIService {

    @Value("${app.ai.base-url}")
    private String aiBaseUrl;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private String extractMessage(String body, String fallback) {
        if (body == null || body.isBlank()) {
            return fallback;
        }

        try {
            Map<?, ?> parsed = objectMapper.readValue(body, Map.class);
            Object message = parsed.get("message");
            if (message != null && !String.valueOf(message).isBlank()) {
                return String.valueOf(message);
            }
        } catch (Exception ignored) {
            // Fall back to raw body text below.
        }

        return body;
    }

    public Map<String, Object> registerFace(String studentId, Object images) {
        try {
            Object normalizedStudentId;
            try {
                normalizedStudentId = Integer.parseInt(studentId);
            } catch (Exception ex) {
                normalizedStudentId = studentId;
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(Map.of(
                    "student_id", normalizedStudentId,
                    "images", images
            ), headers);
            Map<String, Object> response = restTemplate.postForObject(aiBaseUrl + "/api/register", entity, Map.class);
            if (response == null) {
                return Map.of("success", false, "message", "Empty response from AI service");
            }
            return response;
        } catch (HttpStatusCodeException ex) {
            String body = ex.getResponseBodyAsString();
            return Map.of(
                    "success", false,
                    "message", body == null || body.isBlank() ? "AI registration failed" : body,
                    "status", ex.getRawStatusCode()
            );
        } catch (Exception ex) {
            Map<String, Object> out = new HashMap<>();
            out.put("success", false);
            out.put("message", "AI service error: " + ex.getMessage());
            return out;
        }
    }

    public Map<String, Object> recognize(Object image, String courseId, boolean isLive) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(Map.of(
                    "image", image,
                    "course_id", courseId,
                    "is_live", isLive
            ), headers);
            Map<String, Object> response = restTemplate.postForObject(aiBaseUrl + "/api/recognize", entity, Map.class);
            if (response == null) {
                return Map.of("recognized", false, "message", "Empty response from AI service");
            }
            return response;
        } catch (HttpStatusCodeException ex) {
            String body = ex.getResponseBodyAsString();
            return Map.of(
                    "recognized", false,
                    "message", extractMessage(body, "Recognition failed"),
                    "status", ex.getRawStatusCode()
            );
        } catch (Exception ex) {
            Map<String, Object> out = new HashMap<>();
            out.put("recognized", false);
            out.put("message", "AI service error: " + ex.getMessage());
            return out;
        }
    }

    public Map<String, Object> liveness(Object frames) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(Map.of("frames", frames), headers);
            Map<String, Object> response = restTemplate.postForObject(aiBaseUrl + "/api/liveness", entity, Map.class);
            if (response == null) {
                return Map.of("is_live", false, "message", "Empty response from AI service");
            }
            return response;
        } catch (HttpStatusCodeException ex) {
            String body = ex.getResponseBodyAsString();
            return Map.of(
                    "is_live", false,
                    "message", extractMessage(body, "Liveness failed"),
                    "status", ex.getRawStatusCode()
            );
        } catch (Exception ex) {
            Map<String, Object> out = new HashMap<>();
            out.put("is_live", false);
            out.put("message", "AI service error: " + ex.getMessage());
            return out;
        }
    }
}
