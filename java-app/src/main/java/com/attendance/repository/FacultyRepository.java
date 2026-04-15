package com.attendance.repository;

import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;
import com.attendance.model.Faculty;

public interface FacultyRepository extends MongoRepository<Faculty, String> {
    Optional<Faculty> findByEmail(String email);
}
