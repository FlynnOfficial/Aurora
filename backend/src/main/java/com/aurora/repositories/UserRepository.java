package com.aurora.repositories;

import com.aurora.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByEmailIgnoreCase(String email);
    List<User> findByRole(User.UserRole role);
    List<User> findByActive(Boolean active);
    List<User> findByOrganizationKey(String organizationKey);
    List<User> findByOrganizationKeyAndActiveTrue(String organizationKey);
}