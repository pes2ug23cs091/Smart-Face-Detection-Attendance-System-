package com.attendance.dto;

public class LoginRequest {
    private String email;
    private String password;
    private String studentIdOrRoll;

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getStudentIdOrRoll() { return studentIdOrRoll; }
    public void setStudentIdOrRoll(String studentIdOrRoll) { this.studentIdOrRoll = studentIdOrRoll; }
}
