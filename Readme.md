# MiniProject 3

This codebase has 2 modules. 
* mp3 containts the stats model codebase that shows visualizaitons and computes the confidence intervals for a list of observations by lonic code. 
* mp3_backend contains the backend service that connects to the SMART FHIR server and gets observation data by lonic code. 

# Installation
Go into each module: `mp3` and `mp3_backend` and follow the readme instructions on installation and starting up the codebase. 

# Running Module
Running Locally: `docker run -p 8080:8080 springio/gs-spring-boot-docker`

# Example Endpoint
http://localhost:8080/fhir/obsevation?lonicCode=72514-3