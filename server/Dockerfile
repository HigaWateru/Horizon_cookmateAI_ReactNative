# Stage 1: Build stage
FROM eclipse-temurin:21-jdk-jammy AS build
WORKDIR /app

# Copy gradle wrapper and config files
COPY gradle/ gradle/
COPY gradlew gradlew.bat build.gradle settings.gradle ./

# Clean and download dependencies (cached layer)
RUN ./gradlew dependencies --no-daemon || true

# Copy source code and build jar
COPY src/ src/
RUN ./gradlew bootJar -x test --no-daemon

# Stage 2: Run stage
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar

# Expose port (Render overrides this, but good practice)
EXPOSE 8080

# Run Spring Boot application
ENTRYPOINT ["java", "-jar", "app.jar"]
