package com.attendance.api;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import com.attendance.model.Attendance;
import com.attendance.service.AttendanceService;
import com.attendance.service.FaceAIService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;
    private final FaceAIService faceAIService;

    public AttendanceController(AttendanceService attendanceService, FaceAIService faceAIService) {
        this.attendanceService = attendanceService;
        this.faceAIService = faceAIService;
    }

    @PostMapping("/recognize")
    public Map<String, Object> recognizeAndMark(@RequestBody Map<String, Object> payload) {
        String image = String.valueOf(payload.get("image"));
        String courseId = String.valueOf(payload.get("courseId"));
        boolean isLive = Boolean.parseBoolean(String.valueOf(payload.getOrDefault("isLive", false)));

        Map<String, Object> aiResult = faceAIService.recognize(image, courseId, isLive);
        Object recognized = aiResult.get("recognized");

        if (Boolean.TRUE.equals(recognized)) {
            Map<String, Object> student = (Map<String, Object>) aiResult.get("student");
            String studentId = String.valueOf(student.get("student_id"));
            double score = Double.parseDouble(String.valueOf(aiResult.getOrDefault("score", 0.0)));

            boolean alreadyMarked = attendanceService.isMarkedToday(studentId, courseId);
            attendanceService.markAttendance(studentId, courseId, score, isLive);
            aiResult.put("attendance_marked", !alreadyMarked);
            aiResult.put("message", alreadyMarked ? "Already marked today" : "Attendance marked");
        }

        return aiResult;
    }

    @GetMapping("/student/{studentId}")
    public List<Attendance> byStudent(@PathVariable String studentId) {
        return attendanceService.byStudent(studentId);
    }

    @GetMapping("/me")
    public List<Attendance> myAttendance(Authentication authentication) {
        return attendanceService.byStudent(authentication.getName());
    }

    @GetMapping("/course/{courseId}")
    public List<Attendance> byCourseDate(@PathVariable String courseId, @RequestParam String date) {
        return attendanceService.byCourseDate(courseId, LocalDate.parse(date));
    }

    @GetMapping("/date/{date}")
    public List<Attendance> byDate(@PathVariable String date) {
        return attendanceService.byDate(LocalDate.parse(date));
    }

    @PutMapping("/{id}")
    public Attendance update(@PathVariable String id, @RequestBody Attendance request) {
        return attendanceService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        attendanceService.delete(id);
    }
}
