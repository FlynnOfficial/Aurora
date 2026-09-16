package com.aurora.models;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "subjects", uniqueConstraints = @UniqueConstraint(columnNames = {"organization_key", "name"}))
@Data
@NoArgsConstructor
public class Subject {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "organization_key", nullable = false) private String organizationKey;
    @Column(nullable = false) private String name;
    @Column(nullable = false) private Boolean active = true;
}