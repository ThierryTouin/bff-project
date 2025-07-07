FROM eclipse-temurin:17-alpine
COPY target/bff.jar /app/bff.jar
ENTRYPOINT ["java","-jar","/app/bff.jar"]


FROM maven:3.9.4-eclipse-temurin-17-alpine AS builder
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-alpine
WORKDIR /app
COPY --from=builder /app/target/bff-0.0.1-SNAPSHOT.jar ./bff.jar

ENTRYPOINT ["java", "-jar", "bff.jar"]