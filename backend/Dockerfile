# Build stage
FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app

RUN apk add --no-cache maven

COPY pom.xml .
COPY src ./src
RUN mvn -DskipTests clean package -B

# Run stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

COPY --from=build /app/target/outdoor-backend-0.0.1-SNAPSHOT.jar app.jar

# Render sets PORT; Spring Boot reads it via server.port
ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java -jar -Dserver.port=${PORT} app.jar"]
