var Bahmni = Bahmni || {};
Bahmni.Registration = Bahmni.Registration || {};

var constants = {
    patientIdentifierTypeName: "Bahmni Id",
    encounterType: {
        registration: "REG"
    },
    // should be picking this up from global properties.
    visitType: {
        registration: "REG",
        returningPatient: "REVISIT",
        emergency: "EMERGENCY"
    },
    openmrsUrl: "/openmrs",
    baseOpenMRSRESTURL: "/openmrs/ws/rest/v1",
    bahmniRESTBaseURL: "/openmrs/ws/rest/v1/bahmnicore",
    emrApiRESTBaseURL: "/openmrs/ws/rest/emrapi",
    emrApiEncounterUrl: "/openmrs/ws/rest/emrapi/encounter",
    webServiceRestBaseURL: "/openmrs/ws/rest/v1",
    registrationFeesConcept: "REGISTRATION FEES",
    defaultVisitTypeName: "REG", //TODO: Read this from config
    allAddressFileds: ["uuid", "preferred", "address1", "address2", "address3", "address4", "address5", "address6", "cityVillage", "countyDistrict", "stateProvince", "postalCode", "country", "latitude", "longitude"]
};

