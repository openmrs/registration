'use strict';

describe('Patient visit', function () {

    var $http,
        mockHttp = {defaults: {headers: {common: {'X-Requested-With': 'present'}} },
            post: jasmine.createSpy('Http post').andReturn('success')};

    beforeEach(module('registration.patient.services'));
    beforeEach(module(function ($provide) {
        $provide.value('$http', mockHttp);
    }));

    it('Should create a visit', inject(['visitService', function (visitService) {
        var openmrsUrl = 'http://blah.com';
        constants.openmrsUrl = openmrsUrl;
        var visitJson = {
            "encounterTypeUuid": "b469afaa-c79a-11e2-b284-107d46e7b2c5",
            "patientUuid": "027eca99-0b1e-4421-954e-e8778161ddc1",
            "visitTypeUuid": "b5c3bd82-c79a-11e2-b284-107d46e7b2c5",
            "observations":[
                {"conceptName": "REGISTRATION FEES", "value":10, "conceptUuid": "b4afc27e-c79a-11e2-b284-107d46e7b2c5"},
                {"conceptName": "HEIGHT", "value": null, "conceptUuid": "b4b371da-c79a-11e2-b284-107d46e7b2c5"}
            ]
        }

        var results = visitService.create(visitJson);

        expect(mockHttp.post).toHaveBeenCalled();
        expect(mockHttp.post.mostRecentCall.args[0]).toBe(constants.emrApiRESTBaseURL +  '/encounter');
        expect(mockHttp.post.mostRecentCall.args[1]).toBe(visitJson);
        expect(results).toBe('success');
    }]));

});