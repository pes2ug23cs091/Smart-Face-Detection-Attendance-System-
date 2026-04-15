package com.attendance.service;

import java.util.List;
import com.attendance.model.Student;
import com.attendance.repository.StudentRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class StudentService {

    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;

    public StudentService(StudentRepository studentRepository, PasswordEncoder passwordEncoder) {
        this.studentRepository = studentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<Student> getAll() {
        return studentRepository.findAll();
    }

    public Student getById(String id) {
        return studentRepository.findById(id).orElseThrow(() -> new RuntimeException("Student not found"));
    }

    public Student getByStudentId(String studentId) {
        return studentRepository.findByStudentId(normalizeStudentId(studentId))
            .or(() -> studentRepository.findByStudentId(studentId))
            .orElseThrow(() -> new RuntimeException("Student not found"));
    }

    public Student getByStudentIdOrRoll(String key) {
        String normalized = normalizeStudentId(key);
        return studentRepository.findByStudentId(normalized)
            .or(() -> studentRepository.findByStudentId(key))
                .or(() -> studentRepository.findByRollNumber(key))
                .orElseThrow(() -> new RuntimeException("Student not found"));
    }

    public Student create(Student student) {
        student.setStudentId(normalizeStudentId(student.getStudentId()));
        if (student.getPasswordHash() == null || student.getPasswordHash().isBlank()) {
            student.setPasswordHash(passwordEncoder.encode("Student@123"));
        } else {
            student.setPasswordHash(passwordEncoder.encode(student.getPasswordHash()));
        }
        return studentRepository.save(student);
    }

    public Student update(String id, Student request) {
        Student existing = getById(id);
        existing.setName(request.getName());
        existing.setDepartment(request.getDepartment());
        existing.setYear(request.getYear());
        existing.setSection(request.getSection());
        existing.setRollNumber(request.getRollNumber());
        existing.setStudentId(normalizeStudentId(request.getStudentId()));
        existing.setActive(request.isActive());
        return studentRepository.save(existing);
    }

    public void delete(String id) {
        studentRepository.deleteById(id);
    }

    private String normalizeStudentId(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        if (trimmed.matches("\\d+")) {
            return String.valueOf(Integer.parseInt(trimmed));
        }
        return trimmed;
    }
}
