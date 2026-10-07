package com.aurora.models;

import java.util.Set;

public record AdminUserSummary(
        Long id,
        String name,
        String email,
        User.UserRole role,
        String className,
        String enrollment,
        String assignedSubject,
        Set<String> assignedSubjects,
        Set<String> assignedClasses,
        Double average,
        String status,
        long gradeCount,
        long approvedCount,
        long recoveringCount,
        long failedCount
) {}
