package com.attendance.service;

import com.attendance.dto.LoginRequest;
import com.attendance.dto.LoginResponse;
import com.attendance.model.Faculty;
import com.attendance.model.Student;
import com.attendance.repository.FacultyRepository;
import com.attendance.repository.StudentRepository;
import com.attendance.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.UNAUTHORIZED;

@Service
public class AuthService {

    private final FacultyRepository facultyRepository;
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(FacultyRepository facultyRepository,
                       StudentRepository studentRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService) {
        this.facultyRepository = facultyRepository;
        this.studentRepository = studentRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public LoginResponse loginFaculty(LoginRequest request) {
        Faculty faculty = facultyRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResponseStatusException(UNAUTHORIZED, "Invalid faculty credentials"));

        if (!passwordEncoder.matches(request.getPassword(), faculty.getPasswordHash())) {
            throw new ResponseStatusException(UNAUTHORIZED, "Invalid faculty credentials");
        }

        String token = jwtService.generateToken(faculty.getEmail(), "FACULTY", faculty.getId());
        return new LoginResponse(token, "FACULTY", faculty.getId(), faculty.getName());
    }

    public LoginResponse loginStudent(LoginRequest request) {
        String key = request.getStudentIdOrRoll();
        Student student = studentRepository.findByStudentId(key)
                .or(() -> studentRepository.findByRollNumber(key))
                .orElseThrow(() -> new ResponseStatusException(UNAUTHORIZED, "Invalid student credentials"));

        if (!passwordEncoder.matches(request.getPassword(), student.getPasswordHash())) {
            throw new ResponseStatusException(UNAUTHORIZED, "Invalid student credentials");
        }

        String token = jwtService.generateToken(student.getStudentId(), "STUDENT", student.getId());
        return new LoginResponse(token, "STUDENT", student.getId(), student.getName());
    }
}
