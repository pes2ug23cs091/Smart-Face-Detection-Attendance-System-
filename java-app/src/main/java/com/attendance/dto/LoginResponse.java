package com.attendance.dto;

public class LoginResponse {
    private String token;
    private String role;
    private String userId;
    private String name;

    public LoginResponse(String token, String role, String userId, String name) {
        this.token = token;
        this.role = role;
        this.userId = userId;
        this.name = name;
    }

    public String getToken() { return token; }
    public String getRole() { return role; }
    public String getUserId() { return userId; }
    public String getName() { return name; }
}
