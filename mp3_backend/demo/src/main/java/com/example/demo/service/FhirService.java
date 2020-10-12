//package com.example.demo.service;
//
//import org.springframework.stereotype.Service;
//
//@Service
//public class FhirService {
//    // Create a context
//    FhirContextntext ctx = FhirContext.forR4();
//
//    // Create a client
//    IGenericClient client = ctx.newRestfulGenericClient("https://hapi.fhir.org/baseR4");
//
//    // Read a patient with the given ID
//    Patient patient = client.read().resource(Patient.class).withId("example").execute();
//
//    // Print the output
//    String string = ctx.newJsonParser().setPrettyPrint(true).encodeResourceToString(patient);
//    System.out.println(string);
//}
