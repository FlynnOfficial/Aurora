package com.aurora.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "answers", uniqueConstraints = @UniqueConstraint(columnNames = {"submission_id", "question_id"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Answer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "submission_id", nullable = false)
    private Submission submission;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "question_id", nullable = false)
    private ActivityQuestion question;

    @Column(columnDefinition = "TEXT")
    private String answer;

    @Column(precision = 8, scale = 2)
    private BigDecimal score;

    @Column(columnDefinition = "TEXT")
    private String teacherFeedback;
}