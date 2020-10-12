# FHIR Observation Data Module

This codebase connects to the SMART FHIR R4 Resource endpoint and retreives a lis of observation data by lonic code. 
# Installation
Build Docker Image: `docker build -t springio/gs-spring-boot-docker . `

# Running Module
Running Locally: `docker run -p 8080:8080 springio/gs-spring-boot-docker`

# Example Endpoint
http://localhost:8080/fhir/obsevation?lonicCode=72514-3