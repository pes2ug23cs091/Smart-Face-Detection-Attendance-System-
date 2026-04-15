package com.attendance.service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import com.attendance.model.Attendance;
import com.attendance.repository.AttendanceRepository;
import org.springframework.stereotype.Service;

@Service
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;

    public AttendanceService(AttendanceRepository attendanceRepository) {
        this.attendanceRepository = attendanceRepository;
    }

    public Attendance markAttendance(String studentId, String courseId, double confidence, boolean isLive) {
        LocalDate today = LocalDate.now();
        Attendance existing = attendanceRepository.findByStudentIdAndCourseIdAndDate(studentId, courseId, today).orElse(null);
        if (existing != null) {
            return existing;
        }

        Attendance record = new Attendance();
        record.setStudentId(studentId);
        record.setCourseId(courseId);
        record.setDate(today);
        record.setTimeIn(LocalTime.now());
        record.setStatus("present");
        record.setConfidenceScore(confidence);
        record.setLivenessVerified(isLive);
        return attendanceRepository.save(record);
    }

    public boolean isMarkedToday(String studentId, String courseId) {
        return attendanceRepository.findByStudentIdAndCourseIdAndDate(studentId, courseId, LocalDate.now()).isPresent();
    }

    public List<Attendance> byStudent(String studentId) {
        return attendanceRepository.findByStudentId(studentId);
    }

    public List<Attendance> byCourseDate(String courseId, LocalDate date) {
        return attendanceRepository.findByCourseIdAndDate(courseId, date);
    }

    public List<Attendance> byDate(LocalDate date) {
        return attendanceRepository.findByDate(date);
    }

    public Attendance update(String id, Attendance request) {
        Attendance existing = attendanceRepository.findById(id).orElseThrow(() -> new RuntimeException("Attendance not found"));
        existing.setStatus(request.getStatus());
        existing.setConfidenceScore(request.getConfidenceScore());
        existing.setLivenessVerified(request.isLivenessVerified());
        existing.setDate(request.getDate());
        existing.setTimeIn(request.getTimeIn());
        return attendanceRepository.save(existing);
    }

    public void delete(String id) {
        attendanceRepository.deleteById(id);
    }
}
