package com.attendance.service;

import com.attendance.model.Faculty;
import com.attendance.repository.FacultyRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class FacultyService {

    private final FacultyRepository facultyRepository;
    private final PasswordEncoder passwordEncoder;

    public FacultyService(FacultyRepository facultyRepository, PasswordEncoder passwordEncoder) {
        this.facultyRepository = facultyRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<Faculty> getAll() {
        return facultyRepository.findAll();
    }

    public Faculty create(Map<String, Object> payload) {
        String email = String.valueOf(payload.getOrDefault("email", "")).trim().toLowerCase();
        if (email.isBlank()) {
            throw new RuntimeException("Email is required");
        }
        if (facultyRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Faculty email already exists");
        }

        String rawPassword = String.valueOf(payload.getOrDefault("password", "Faculty@123")).trim();
        if (rawPassword.isBlank()) {
            rawPassword = "Faculty@123";
        }

        Faculty faculty = new Faculty();
        faculty.setName(String.valueOf(payload.getOrDefault("name", "")).trim());
        faculty.setEmail(email);
        faculty.setDepartment(String.valueOf(payload.getOrDefault("department", "")).trim());
        faculty.setPasswordHash(passwordEncoder.encode(rawPassword));
        faculty.setRole("FACULTY");
        faculty.setActive(Boolean.parseBoolean(String.valueOf(payload.getOrDefault("active", true))));
        return facultyRepository.save(faculty);
    }

    public Faculty update(String id, Map<String, Object> payload) {
        Faculty existing = facultyRepository.findById(id).orElseThrow(() -> new RuntimeException("Faculty not found"));

        if (payload.containsKey("name")) {
            existing.setName(String.valueOf(payload.get("name")).trim());
        }
        if (payload.containsKey("department")) {
            existing.setDepartment(String.valueOf(payload.get("department")).trim());
        }
        if (payload.containsKey("active")) {
            existing.setActive(Boolean.parseBoolean(String.valueOf(payload.get("active"))));
        }
        if (payload.containsKey("password")) {
            String newPassword = String.valueOf(payload.get("password")).trim();
            if (!newPassword.isBlank()) {
                existing.setPasswordHash(passwordEncoder.encode(newPassword));
            }
        }

        return facultyRepository.save(existing);
    }

    public void delete(String id) {
        facultyRepository.deleteById(id);
    }
}
