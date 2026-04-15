package com.attendance.api;

import com.attendance.service.AttendanceService;
import com.attendance.service.FaceAIService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/public/attendance")
public class PublicAttendanceController {

    @Value("${app.face.min-score:0.78}")
    private double minScore;

    private final FaceAIService faceAIService;
    private final AttendanceService attendanceService;

    public PublicAttendanceController(FaceAIService faceAIService, AttendanceService attendanceService) {
        this.faceAIService = faceAIService;
        this.attendanceService = attendanceService;
    }

    @PostMapping("/recognize")
    public Map<String, Object> recognizeAndMark(@RequestBody Map<String, Object> payload) {
        String image = String.valueOf(payload.get("image"));
        String courseId = String.valueOf(payload.get("courseId"));
        boolean isLive = Boolean.parseBoolean(String.valueOf(payload.getOrDefault("isLive", false)));

        Map<String, Object> aiResult = faceAIService.recognize(image, courseId, isLive);
        Object recognized = aiResult.get("recognized");

        if (Boolean.TRUE.equals(recognized)) {
            double score = Double.parseDouble(String.valueOf(aiResult.getOrDefault("score", 0.0)));
            if (score < minScore) {
                aiResult.put("recognized", false);
                aiResult.put("message", "Low confidence match rejected");
                return aiResult;
            }

            Object studentObj = aiResult.get("student");
            if (studentObj instanceof Map) {
                Map<?, ?> student = (Map<?, ?>) studentObj;
                String studentId = String.valueOf(student.get("student_id"));
                boolean alreadyMarked = attendanceService.isMarkedToday(studentId, courseId);
                attendanceService.markAttendance(studentId, courseId, score, isLive);
                aiResult.put("attendance_marked", !alreadyMarked);
                aiResult.put("message", alreadyMarked ? "Already marked today" : "Attendance marked");
            }
        }

        return aiResult;
    }
}
