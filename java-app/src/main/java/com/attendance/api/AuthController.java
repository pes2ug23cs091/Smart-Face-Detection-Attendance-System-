package com.attendance.api;

import com.attendance.dto.LoginRequest;
import com.attendance.dto.LoginResponse;
import com.attendance.service.AuthService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/faculty/login")
    public LoginResponse facultyLogin(@RequestBody LoginRequest request) {
        return authService.loginFaculty(request);
    }

    @PostMapping("/student/login")
    public LoginResponse studentLogin(@RequestBody LoginRequest request) {
        return authService.loginStudent(request);
    }
}
