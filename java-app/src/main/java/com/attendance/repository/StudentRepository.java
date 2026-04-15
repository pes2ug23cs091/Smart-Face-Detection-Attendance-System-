package com.attendance.repository;

import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;
import com.attendance.model.Student;

public interface StudentRepository extends MongoRepository<Student, String> {
    Optional<Student> findByStudentId(String studentId);
    Optional<Student> findByRollNumber(String rollNumber);
}
