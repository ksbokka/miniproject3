FROM openjdk:8-jdk-alpine
#ARG JAR_FILE=target/*.jar
COPY build/libs/* app.jar
ENTRYPOINT ["java","-jar","/app.jar"]