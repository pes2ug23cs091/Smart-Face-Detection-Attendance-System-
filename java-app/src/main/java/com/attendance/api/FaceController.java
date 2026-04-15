package com.attendance.api;

import com.attendance.service.FaceAIService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/face")
public class FaceController {

    private final FaceAIService faceAIService;

    public FaceController(FaceAIService faceAIService) {
        this.faceAIService = faceAIService;
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody Map<String, Object> payload) {
        String studentId = String.valueOf(payload.get("studentId"));
        Object images = payload.get("images");
        Map<String, Object> response = faceAIService.registerFace(studentId, images);
        boolean ok = !Boolean.FALSE.equals(response.get("success"));
        return ok ? ResponseEntity.ok(response) : ResponseEntity.status(502).body(response);
    }

    @PostMapping("/liveness")
    public Map<String, Object> liveness(@RequestBody Map<String, Object> payload) {
        return faceAIService.liveness(payload.get("frames"));
    }
}
