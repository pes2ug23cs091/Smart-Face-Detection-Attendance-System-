package com.attendance.service;

import java.util.List;
import com.attendance.model.Course;
import com.attendance.repository.CourseRepository;
import org.springframework.stereotype.Service;

@Service
public class CourseService {

    private final CourseRepository courseRepository;

    public CourseService(CourseRepository courseRepository) {
        this.courseRepository = courseRepository;
    }

    public List<Course> getAll() {
        return courseRepository.findAll();
    }

    public Course create(Course course) {
        return courseRepository.save(course);
    }

    public Course update(String id, Course request) {
        Course existing = courseRepository.findById(id).orElseThrow(() -> new RuntimeException("Course not found"));
        existing.setCourseName(request.getCourseName());
        existing.setCourseCode(request.getCourseCode());
        existing.setSection(request.getSection());
        existing.setFacultyId(request.getFacultyId());
        existing.setStudentIds(request.getStudentIds());
        existing.setActive(request.isActive());
        return courseRepository.save(existing);
    }

    public void delete(String id) {
        courseRepository.deleteById(id);
    }
}
