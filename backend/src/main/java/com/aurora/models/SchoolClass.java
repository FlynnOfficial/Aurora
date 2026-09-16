package com.aurora.models;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "classes", uniqueConstraints = @UniqueConstraint(columnNames = {"organization_key", "name", "school_year"}))
@Data
@NoArgsConstructor
public class SchoolClass {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "organization_key", nullable = false) private String organizationKey;
    @Column(nullable = false) private String name;
    @Column(name = "school_year", nullable = false) private Integer schoolYear;
    @Column(nullable = false) private Boolean active = true;
}