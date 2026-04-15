package com.attendance.api;

import java.util.List;
import java.util.stream.Collectors;
import com.attendance.model.Student;
import com.attendance.service.StudentService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @GetMapping
    public List<Student> all(@RequestParam(required = false) String section) {
        List<Student> students = studentService.getAll();
        if (section == null || section.isBlank()) {
            return students;
        }
        return students.stream()
                .filter(s -> s.getSection() != null && s.getSection().equalsIgnoreCase(section.trim()))
                .collect(Collectors.toList());
    }

    @GetMapping("/me")
    public Student me(Authentication authentication) {
        String studentKey = authentication.getName();
        return studentService.getByStudentIdOrRoll(studentKey);
    }

    @PostMapping
    public Student create(@RequestBody Student student) {
        return studentService.create(student);
    }

    @PutMapping("/{id}")
    public Student update(@PathVariable String id, @RequestBody Student student) {
        return studentService.update(id, student);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        studentService.delete(id);
    }
}
