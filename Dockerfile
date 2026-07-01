# ---- Stage 1: build the jar ----
FROM eclipse-temurin:17-jdk AS build
WORKDIR /app

# Copy the Maven wrapper first and warm the dependency cache. This layer is
# only rebuilt when pom.xml changes, so ordinary code changes build fast.
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw -q dependency:go-offline

# Now copy sources and build.
COPY src/ src/
RUN ./mvnw -q clean package -DskipTests

# ---- Stage 2: slim runtime image ----
FROM eclipse-temurin:17-jre
WORKDIR /app

# Copy just the built jar from the build stage.
COPY --from=build /app/target/todolist-1.0.0.jar app.jar

# The app reads $PORT (set by the host) and falls back to 8082 locally.
EXPOSE 8082
ENTRYPOINT ["java", "-jar", "app.jar"]
