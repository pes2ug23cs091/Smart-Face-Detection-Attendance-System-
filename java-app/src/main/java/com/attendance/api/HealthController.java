package com.attendance.api;

import com.attendance.model.Student;
import com.attendance.repository.StudentRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
public class HealthController {

    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;

    public HealthController(StudentRepository studentRepository, PasswordEncoder passwordEncoder) {
        this.studentRepository = studentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/api/health")
    public Map<String, Object> health() {
        return Map.of("status", "ok", "service", "java-backend");
    }

    @GetMapping("/api/public/seed-student")
    public Map<String, Object> seedStudent() {
        if (studentRepository.findByStudentId("1").isEmpty()) {
            Student s = new Student();
            s.setStudentId("1");
            s.setRollNumber("21CS001");
            s.setName("Arjun Mehta");
            s.setDepartment("Computer Science");
            s.setYear(3);
            s.setSection("A");
            s.setPasswordHash(passwordEncoder.encode("Student@123"));
            s.setActive(true);
            studentRepository.save(s);
        }
        return Map.of("status", "ok");
    }
}
