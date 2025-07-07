FROM maven:3.9.4-eclipse-temurin-17-alpine AS builder
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-alpine
WORKDIR /app
COPY --from=builder /app/target/apis-0.0.1-SNAPSHOT.jar ./apis.jar

ENTRYPOINT ["java", "-jar", "apis.jar"]
