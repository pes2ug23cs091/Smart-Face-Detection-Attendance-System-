package com.attendance.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.attendance.model.Course;

public interface CourseRepository extends MongoRepository<Course, String> {
}
