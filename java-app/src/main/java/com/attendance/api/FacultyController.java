package com.attendance.api;

import com.attendance.model.Faculty;
import com.attendance.service.FacultyService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/faculty")
public class FacultyController {

    private final FacultyService facultyService;

    public FacultyController(FacultyService facultyService) {
        this.facultyService = facultyService;
    }

    @GetMapping
    public List<Faculty> all() {
        return facultyService.getAll();
    }

    @PostMapping
    public Faculty create(@RequestBody Map<String, Object> payload) {
        return facultyService.create(payload);
    }

    @PutMapping("/{id}")
    public Faculty update(@PathVariable String id, @RequestBody Map<String, Object> payload) {
        return facultyService.update(id, payload);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        facultyService.delete(id);
    }
}
