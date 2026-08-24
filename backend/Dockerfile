FROM maven:3.9-eclipse-temurin-21 AS build

WORKDIR /app
COPY pom.xml .
RUN mvn -B dependency:go-offline
COPY src ./src
RUN mvn -B clean package -DskipTests && ls -lh /app/target/*.jar

FROM eclipse-temurin:21-jre

WORKDIR /app
COPY --from=build /app/target/aurora-backend-1.0.0.jar app.jar
RUN ls -lh /app/app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]