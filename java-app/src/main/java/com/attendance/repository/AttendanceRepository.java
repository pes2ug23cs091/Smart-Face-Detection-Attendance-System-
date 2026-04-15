package com.attendance.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;
import com.attendance.model.Attendance;

public interface AttendanceRepository extends MongoRepository<Attendance, String> {
    Optional<Attendance> findByStudentIdAndCourseIdAndDate(String studentId, String courseId, LocalDate date);
    List<Attendance> findByStudentId(String studentId);
    List<Attendance> findByStudentIdAndCourseId(String studentId, String courseId);
    List<Attendance> findByCourseIdAndDate(String courseId, LocalDate date);
    List<Attendance> findByDate(LocalDate date);
} 