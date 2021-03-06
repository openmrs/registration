'use strict';

angular.module('registration.patient.controllers')
    .controller('CreatePatientController', ['$scope', '$rootScope','patientService', 'visitService','$location', 'Preferences', '$route', 'patient', '$window', 'errorCode', 'dateUtil', 'spinner', 'printer', 'appService', '$timeout',
    function ($scope, $rootScope, patientService, visitService, $location, preferences, $route, patientModel, $window, errorCode, dateUtil, spinner, printer, appService, $timeout) {
        var createActionsConfig = [];
        var defaultActions = ["save", "print", "startVisit"];
        var regEncounterTypeUuid = $rootScope.encounterConfiguration.encounterTypes[constants.encounterType.registration];
        var identifyEditActions = function() {
            createActionsConfig = appService.getAppDescriptor().getExtensions("org.bahmni.registration.patient.create.action", "config");
            var createActions = createActionsConfig.filter(function(config) {
                if (config.extensionParams) {
                    return config.extensionParams.action ? defaultActions.indexOf(config.extensionParams.action) > -1 : false;
                } else {
                    return false;
                }
            });
            $scope.createActions = createActions;
        };

        (function () {
            $scope.patient = patientModel.create();
            $scope.identifierSources = $rootScope.patientConfiguration.identifierSources;
            var identifierPrefix = $scope.identifierSources.filter(function (identifierSource) {
                return identifierSource.prefix === preferences.identifierPrefix;
            });
            $scope.patient.identifierPrefix = identifierPrefix[0] || $scope.identifierSources[0];
            $scope.hasOldIdentifier = preferences.hasOldIdentifier;
            identifyEditActions();
        })();

        var getDefaultVisitType = function() {
            var defaultVisitType = $route.current.params.visitType || constants.defaultVisitTypeName;
            var visitTypesAsArray = $rootScope.encounterConfiguration.getVistTypesAsArray();
            var visitArray = visitTypesAsArray.filter(function(visitType) {
                return visitType.name == defaultVisitType;
            });
            return visitArray.length > 0 ? visitArray[0].name : constants.defaultVisitTypeName;
        };

        $scope.visitControl = new Bahmni.Registration.VisitControl($rootScope.encounterConfiguration.getVistTypesAsArray(), getDefaultVisitType(), visitService);
        $scope.visitControl.onStartVisit = function(visitType) {
            $scope.setSubmitSource('startVisit');
        };

        $scope.patientCommon = function () {
            return $route.routes['/patientcommon'].templateUrl;
        };

        $scope.setSubmitSource = function (source) {
            $scope.submitSource = source;
        };

        var setPreferences = function () {
            preferences.identifierPrefix = $scope.patient.identifierPrefix.prefix;
            preferences.hasOldIdentifier = $scope.hasOldIdentifier;
        };

        var successCallback = function (patientProfileData) {
            $scope.patient.uuid = patientProfileData.patient.uuid;
            $scope.patient.identifier = patientProfileData.patient.identifiers[0].identifier;
            $scope.patient.name = patientProfileData.patient.person.names[0].display;
            $scope.patient.isNew = true;
            $scope.patient.registrationDate = dateUtil.now();
        };

        var createEncounterObject = function() {
            var encounter = {
                encounterTypeUuid:regEncounterTypeUuid
            }
            encounter.providers = encounter.providers || [];
            if ($rootScope.currentProvider && $rootScope.currentProvider.uuid) {
                encounter.providers.push( { "uuid" : $rootScope.currentProvider.uuid } );
            }
            return encounter;
        }

        var followUpAction = function(patientProfileData) {
            if($scope.submitSource == 'startVisit') {
                $scope.visitControl.createVisit(patientProfileData.patient.uuid, createEncounterObject()).success(function(){
                    var patientUrl = $location.absUrl().replace("new", patientProfileData.patient.uuid) + "?newpatient=true";
                    $scope.patient.registrationDate = dateUtil.now();
                    patientService.rememberPatient($scope.patient);
                    $window.history.pushState(null, null, patientUrl);
                    $location.path("/patient/" + patientProfileData.patient.uuid + "/visit");
                }).error(function(){ spinner.hide(); });
            } else if ($scope.submitSource == 'print') {
                $timeout(function(){
                    printer.print('registrationCard');
                    goToActionUrl('print', patientProfileData);
                });
            } else {
                goToActionUrl($scope.submitSource, patientProfileData);
            }
        };

        var goToActionUrl = function(actionName, patientProfileData) {
            if ($scope.createActions) {
                var matchedExtensions = $scope.createActions.filter(function(extension) {
                    return extension.extensionParams && extension.extensionParams.action === actionName;
                });
                if (matchedExtensions.length > 0) {
                    var extensionParams = matchedExtensions[0].extensionParams;
                    if (extensionParams && extensionParams.forwardUrl) {
                        var fwdUrl = appService.getAppDescriptor().formatUrl(extensionParams.forwardUrl, {'patientUuid' : patientProfileData.patient.uuid} );
                        spinner.hide();
                        $location.url(fwdUrl);
                    }
                }
            }
        };

        $scope.printLayout = function () {
            return $route.routes['/printPatient'].templateUrl;
        };

        $scope.create = function () {
            setPreferences();

            var errorCallBack = function (data) {
                spinner.hide();
            };

            if (!$scope.patient.identifier) {
                patientService.generateIdentifier($scope.patient).then(function (response) {
                    $scope.patient.identifier = response.data;
                    patientService.create($scope.patient).success(successCallback).success(followUpAction).error(errorCallBack);
                });
            } else {
                patientService.create($scope.patient).success(successCallback).success(followUpAction).error(errorCallBack);
            }
            spinner.show();
        };
    }]);
