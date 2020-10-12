//adapted from the cerner smart on fhir guide. updated to utalize client.js v2 library and FHIR R4

//create a fhir client based on the sandbox enviroment and test paitnet.
const client = new FHIR.client({
  serverUrl: "https://r4.smarthealthit.org",
  tokenResponse: {
    // patient: "a6889c6d-6915-4fac-9d2f-fc6c42b3a82e"
    patient: "155d3d80-f3f0-4b39-9207-0d122cf94a11"
  }
});

// helper function to process fhir resource to get the patient name.
function getPatientName(pt) {
  if (pt.name) {
    var names = pt.name.map(function(name) {
      return name.given.join(" ") + " " + name.family;
    });
    return names.join(" / ")
  } else {
    return "anonymous";
  }
}

// display the patient name gender and dob in the index page
function displayPatient(pt) {
  document.getElementById('patient_name').innerHTML = getPatientName(pt);
  document.getElementById('gender').innerHTML = pt.gender;
  document.getElementById('dob').innerHTML = pt.birthDate;
}

//function to display list of medications
function displayMedication(meds) {
  med_list.innerHTML += "<li> " + meds + "</li>";
}

//helper function to get quanity and unit from an observation resoruce.
function getQuantityValueAndUnit(ob) {
  if (typeof ob != 'undefined' &&
    typeof ob.valueQuantity != 'undefined' &&
    typeof ob.valueQuantity.value != 'undefined' &&
    typeof ob.valueQuantity.unit != 'undefined') {
    return Number(parseFloat((ob.valueQuantity.value)).toFixed(2)) + ' ' + ob.valueQuantity.unit;
  } else {
    return undefined;
  }
}

// helper function to get both systolic and diastolic bp
function getBloodPressureValue(BPObservations, typeOfPressure) {
  var formattedBPObservations = [];
  BPObservations.forEach(function(observation) {
    var BP = observation.component.find(function(component) {
      return component.code.coding.find(function(coding) {
        return coding.code == typeOfPressure;
      });
    });
    if (BP) {
      observation.valueQuantity = BP.valueQuantity;
      formattedBPObservations.push(observation);
    }
  });

  return getQuantityValueAndUnit(formattedBPObservations[0]);
}

// create a patient object to initalize the patient
function defaultPatient() {
  return {
    height: {
      value: ''
    },
    weight: {
      value: ''
    },
    sys: {
      value: ''
    },
    dia: {
      value: ''
    },
    ldl: {
      value: ''
    },
    hdl: {
      value: ''
    },
    note: 'No Annotation',
  };
}

//helper function to display the annotation on the index page
function displayAnnotation(annotation) {
  note.innerHTML = annotation;
}

//function to display the observation values you will need to update this
function displayObservation(obs) {
  hdl.innerHTML = obs.hdl;
  ldl.innerHTML = obs.ldl;
  sys.innerHTML = obs.sys;
  dia.innerHTML = obs.dia;
  height.innerHTML = obs.height;
  weight.innerHTML = obs.weight;
}

// get patient object and then display its demographics info in the banner
client.request(`Patient/${client.patient.id}`).then(
  function(patient) {
    displayPatient(patient);
    console.log(patient);
  }
);

// get observation resoruce values
// you will need to update the below to retrive the weight and height values
var query = new URLSearchParams();

query.set("patient", client.patient.id);
query.set("_count", 100);
query.set("_sort", "-date");
query.set("code", [
  'http://loinc.org|8462-4',
  'http://loinc.org|8480-6',
  'http://loinc.org|2085-9',
  'http://loinc.org|2089-1',
  'http://loinc.org|55284-4',
  'http://loinc.org|3141-9',
  'http://loinc.org|29463-7',
].join(","));

client.request("Observation?" + query, {
  pageLimit: 0,
  flat: true
}).then(
  function(ob) {

    // group all of the observation resoruces by type into their own
    var byCodes = client.byCodes(ob, 'code');
    const getObservations = client.byCodes(ob, "code");
    var systolicbp = getBloodPressureValue(byCodes('55284-4'), '8480-6');
    var diastolicbp = getBloodPressureValue(byCodes('55284-4'), '8462-4');
    var hdl = byCodes('2085-9');
    var ldl = byCodes('2089-1');
    var height = byCodes('8302-2');
    // var weight = byCodes("3141-9");
    var weight = getObservations("29463-7", "3141-9");

    // create patient object
    var p = defaultPatient();

    // set patient value parameters to the data pulled from the observation resoruce
    if (typeof systolicbp != 'undefined') {
      p.sys = systolicbp;
    } else {
      p.sys = 'undefined'
    }

    if (typeof diastolicbp != 'undefined') {
      p.dia = diastolicbp;
    } else {
      p.dia = 'undefined'
    }

    p.hdl = getQuantityValueAndUnit(hdl[0]);
    p.ldl = getQuantityValueAndUnit(ldl[0]);
    p.height = getQuantityValueAndUnit(height[0]);
    p.weight = getQuantityValueAndUnit(weight[0]);
    // console.log(p);
    // console.log(weight);
    displayObservation(p);

  });


// dummy data for medrequests
// var medResults = ["SAMPLE Lasix 40mg","SAMPLE Naproxen sodium 220 MG Oral Tablet","SAMPLE Amoxicillin 250 MG"]

client.request("MedicationRequest?patient=" + client.patient.id, {
  resolveReferences: [ "medicationReference" ],
  graph: true
}).then(
  function(data) {
    var medList = []
    console.log(data);
    if(data.entry) {
      data.entry.forEach(function(med) {
        if(med.resource.medicationCodeableConcept) {
          medList.push(med.resource.medicationCodeableConcept.text);
        }
      });
    }
    medList.forEach(function(med) {
      displayMedication(med);
    })
    console.log(medList);
    return medList;
});

// get medication request resources this will need to be updated
// the goal is to pull all the medication requests and display it in the app. It can be both active and stopped medications
// medResults.forEach(function(med) {
//   displayMedication(med);
// })

function updateAnnotation(weightObservation){
  client.request("Observation?" + query, {
    pageLimit: 0,
    flat: true
  }).then(
    function(ob) {
      const getObservations = client.byCodes(ob, "code");
      var weight = getObservations("29463-7", "3141-9");
      console.log(weight);
      console.log(weight[0].id);
      weight[0].note[weight[0].note.length + 1] = weightObservation;
      console.log(weight);
      console.log(typeof(weight));
      client.update(JSON.stringify(weight));
      client.request({
        resourceType: "Observation",
        url: "Observation/" + weight[0].id,
        "Content-Type": "application/fhir+json",
        method: "PUT",
        body: JSON.stringify(weight[0])
    });
    // client.observation.update({weight[0].resourceType, weight[0], id:})
  });
}

function updateWeightAnnotation(annotation){
  console.log(annotation);
  var weightObservation = {
    'authorString': 'testUser1',
    'time': new Date().toISOString(),
    'text': annotation
  };
  console.log(weightObservation);
  displayAnnotation(annotation);
  updateAnnotation(weightObservation)
}
//update function to take in text input from the app and add the note for the latest weight observation annotation
//you should include text and the author can be set to anything of your choice. keep in mind that this data will
// be posted to a public sandbox
function addWeightAnnotation() {
  // var annotation = "test annotation"
  // var test_annotation = document.getElementById("annotation").value;
  // alert(test_annotation);
  // console.log(annotation);
  // console.log(test_annotation);
  // console.log(document.getElementById("annotation").value);
  // console.log(document.getElementsByClassName("annotation-box")[0].value);
  var annotation = document.getElementById("annotation");
  var text = window.onload = function() {
    annotation.addEventListener("change", function() {
      updateWeightAnnotation(this.value);
    });
  }
  client.request("Observation?" + query, {
    pageLimit: 0,
    flat: true
  }).then(
    function(ob) {
      const getObservations = client.byCodes(ob, "code");
      var weight = getObservations("29463-7", "3141-9");
      console.log(weight);
  });
  // console.log(text.target.value);
  // // var annotation = document.getElementById("annotation").addEventListener("input", getAnnotation());
  // console.log(annotation);
  // document.getElementById("annotation").addEventListener("")
  // displayAnnotation(annotation);

}

//event listner when the add button is clicked to call the function that will add the note to the weight observation
// console.log(document.getElementById("note").innerHTML.textContent);
document.getElementById('add').addEventListener('click', addWeightAnnotation());
// document.getElementById("annotation").addEventListener("input")
