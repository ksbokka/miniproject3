package com.example.demo.controller;

import ca.uhn.fhir.util.BundleUtil;
import com.google.gson.Gson;

import org.hl7.fhir.instance.model.api.IBaseBundle;
import org.hl7.fhir.instance.model.api.IBaseResource;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import ca.uhn.fhir.context.FhirContext;
import ca.uhn.fhir.rest.client.api.IGenericClient;
import org.hl7.fhir.r4.model.Observation;
import org.hl7.fhir.r4.model.Bundle;

import java.lang.reflect.Array;
import java.util.ArrayList;
import java.util.HashMap;

@RestController
@RequestMapping("/fhir")
public class FHIRController {
    FhirContext ctx = FhirContext.forR4();


    Gson gson = new Gson();
    // Create a client
    IGenericClient client = ctx.newRestfulGenericClient("https://r4.smarthealthit.org");

    @GetMapping("/obsevation")
    public String getObservation(@RequestParam() String lonicCode) {
        if(lonicCode == null) {
            lonicCode = "72514-3";
            lonicCode = "6299-2";
        }
        Bundle bundle = client.search().forResource(Observation.class)
                .where(Observation.CODE.exactly().code(lonicCode))
                .returnBundle(Bundle.class).execute();

        ArrayList<Observation> observationList = new ArrayList<>();
        observationList = getCompleteBundleAsList(bundle, client, Observation.class);
        System.out.println(bundle.getTotal());
        System.out.println(observationList.size());
        ArrayList<Double> dataSet = new ArrayList<Double>();
        for(Observation observation: observationList){
            dataSet.add(getValue(observation));
        }

        return gson.toJson(dataSet);
    }

    private Double getValue(Observation observation) {
        Double painTolerance = null;

        if(observation.hasValueQuantity() == true) {
            painTolerance = observation.getValueQuantity().getValue().doubleValue();
        }
        return painTolerance;
    }


    static public <T extends IBaseResource> ArrayList<T> getCompleteBundleAsList(Bundle bundle, IGenericClient client, Class<T> resourceClass) {
        // Create List to hold our resources.
        ArrayList<T> list = new ArrayList<T>();

        // The bundle starts on page 1, so before moving forward add all of those Resources to the list.
        list.addAll(BundleUtil.toListOfResourcesOfType(client.getFhirContext(), bundle, resourceClass));

        // Loop through the Bundle based on the presence of a link element with a relation of next.
        while (bundle.getLink(IBaseBundle.LINK_NEXT) != null) {
            // Load the next page.
            bundle = client.loadPage().next(bundle).execute();
            // Add those resources to the list.
            list.addAll(BundleUtil.toListOfResourcesOfType(client.getFhirContext(), bundle, resourceClass));
        }
        return list;
    }
}
