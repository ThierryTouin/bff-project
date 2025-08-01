FROM maven:3.9.4-eclipse-temurin-17-alpine AS builder
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

COPY wait-for-keycloak.sh /app/wait-for-keycloak.sh
RUN chmod +x /app/wait-for-keycloak.sh
ENTRYPOINT ["/app/wait-for-keycloak.sh"]

#CMD ["mvn", "spring-boot:run"]
CMD ["mvn", "spring-boot:run", "-Dspring-boot.run.jvmArguments='-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5005'"]
