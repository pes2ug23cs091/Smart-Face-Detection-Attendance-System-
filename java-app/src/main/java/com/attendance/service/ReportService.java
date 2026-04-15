package com.attendance.service;

import com.attendance.model.Attendance;
import com.attendance.repository.AttendanceRepository;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ReportService {

    private final AttendanceRepository attendanceRepository;

    public ReportService(AttendanceRepository attendanceRepository) {
        this.attendanceRepository = attendanceRepository;
    }

    public Map<String, Object> studentSummary(String studentId) {
        List<Attendance> all = attendanceRepository.findByStudentId(studentId);
        long total = all.size();
        long present = all.stream().filter(a -> "present".equalsIgnoreCase(a.getStatus())).count();
        double percentage = total == 0 ? 0 : (present * 100.0 / total);

        Map<String, Object> out = new HashMap<>();
        out.put("studentId", studentId);
        out.put("totalClasses", total);
        out.put("presentCount", present);
        out.put("attendancePercentage", Math.round(percentage * 100.0) / 100.0);
        out.put("records", all);
        return out;
    }
}
