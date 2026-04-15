package com.attendance.config;

import com.attendance.model.Faculty;
import com.attendance.model.Student;
import com.attendance.repository.FacultyRepository;
import com.attendance.repository.StudentRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class BootstrapData {

    @Bean
    CommandLineRunner seedDefaults(FacultyRepository facultyRepository,
                                   StudentRepository studentRepository,
                                   PasswordEncoder passwordEncoder) {
        return args -> {
            if (facultyRepository.findByEmail("admin@college.edu").isEmpty()) {
                Faculty faculty = new Faculty();
                faculty.setName("Admin User");
                faculty.setEmail("admin@college.edu");
                faculty.setPasswordHash(passwordEncoder.encode("Admin@123"));
                faculty.setRole("FACULTY");
                faculty.setActive(true);
                facultyRepository.save(faculty);
            }

            if (facultyRepository.findByEmail("faculty@college.edu").isEmpty()) {
                Faculty faculty = new Faculty();
                faculty.setName("Faculty User");
                faculty.setEmail("faculty@college.edu");
                faculty.setPasswordHash(passwordEncoder.encode("Faculty@123"));
                faculty.setRole("FACULTY");
                faculty.setActive(true);
                facultyRepository.save(faculty);
            }

            if (studentRepository.findByStudentId("1").isEmpty()) {
                Student student = new Student();
                student.setStudentId("1");
                student.setRollNumber("21CS001");
                student.setName("Demo Student");
                student.setDepartment("Computer Science");
                student.setYear(3);
                student.setSection("A");
                student.setPasswordHash(passwordEncoder.encode("Student@123"));
                student.setActive(true);
                studentRepository.save(student);
            }
        };
    }
}
