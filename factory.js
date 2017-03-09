(function () {
    'use strict';

    /**
     * @ngdoc service
     * @name pdr.core.ProviderModelFactory
     * @description Provides a base model factory for core
     *
     * Pseudo-classical pattern
     * Learn more at: http://javascript.info/tutorial/pseudo-classical-pattern
     * Other Patterns won't work because of this service being a singleton
     *
     * @example
     *
     * The following shows you to create a new base model, overloading, how to call
     * a method within, and how to make a call the super function
     *
     * '''js
     * var config = {};
     * var model = new ProviderModelFactory(config);
     *
     * //Overriding (polymorphism)
     *
     * model.overRideSampleMethod = function() {
     *
     *   //Call method applied to the class
     *   this.sampleMethod.call(this);
     *
     *   //Call original method but reference new model by passing this to method call
     *   ProviderModelFactory.prototype.overRideSampleMethod.call(this);
     *
     *   return this;
     *
     * };
     * '''
     */

    angular
        .module('pdr.core')
        .factory('ProviderModelFactory', ProviderModelFactory);

    ProviderModelFactory.$inject = ['$http', '$q', '$modal', 'ROSTER_CONSTANTS'];


    function ProviderModelFactory($http, $q, $modal, ROSTER_CONSTANTS) {

        /**
         * @ngdoc method
         * @name Model
         * @methodOf pdr.core.ProviderModelFactory
         * @param {object=} optional config
         * @returns {void}
         */

        function Model(config) {
            this.config = {
                'ErrorMessage': '',
                'ServiceEndpoint': '',
                'showModal': true
            };
            this._properties = {
                'response': null,
                'responseData': null
            };

            if (angular.isObject(config)) {
                if (config.hasOwnProperty('ErrorMessage')) {
                    this.config.ErrorMessage = config.ErrorMessage;
                }
                if (config.hasOwnProperty('ServiceEndpoint')) {
                    this.config.ServiceEndpoint = config.ServiceEndpoint;
                }
                if (config.hasOwnProperty('showModal')) {
                    this.config.showModal = config.showModal;
                }
            }

        }

        Model.prototype = {

            /**
             * @ngdoc method
             * @name getResponse
             * @methodOf pdr.core.ProviderModelFactory
             * @returns {Object} The response
             * @public
             */
            'getResponse': function () {
                return this._properties.response;
            },

            /**
             * @ngdoc method
             * @name getResponseData
             * @methodOf pdr.core.ProviderModelFactory
             * @returns {Object} the data response
             * @public
             */
            'getResponseData': function () {
                return this._properties.responseData;
            },
            /**
             * @ngdoc method
             * @name resetServiceProperties
             * @methodOf pdr.core.ProviderModelFactory
             * @returns {*} The instance
             * @public
             */
            'resetServiceProperties': function () {
                this._setResponse.call(this, null).setResponseData_.call(this);
                return this;
            },
            /**
             * @ngdoc method
             * @name callService
             * @methodOf pdr.core.ProviderModelFactory
             * @returns {Function} the promise
             * @public
             */

            'callService': function (params, isFile) {
                var deferred = $q.defer(),
                    _ServiceErrorMessage = this.config.ErrorMessage,
                    endpoint = this.config.ServiceEndpoint,
                    params = params || {},
                    isFile = isFile || false,
                    httpHeaders = {
                        'headers': {
                            'Content-Type': 'application/json'
                        }
                    },
                    _response = this.getResponse.call(this);

                if (isFile) {
                    httpHeaders.headers['Content-Type'] = undefined;
                    httpHeaders['transformRequest'] = angular.identity;
                }

                var self = this;

                if (null !== _response) {
                    /* Resolve the deferred $q object before returning the promise */
                    deferred.resolve(true);
                } else {
                    var modalInstance = {
                        'dismiss': angular.noop
                    };
                    if (this.config.showModal) {
                        modalInstance = $modal.open({
                            templateUrl: ROSTER_CONSTANTS.PROGRESS_INDICATOR_TEMPALTE,
                            windowClass: "no-shadow"
                        });
                    }
                    $http.post(endpoint, params, httpHeaders).then(function (response) {
                        /* Store your data or what ever....
                         Then resolve  */
                        modalInstance.dismiss('cancel');
                        var resolved = self._handleCallServiceResponse.call(self, response);
                        if (resolved === true) {
                            deferred.resolve(true);
                        } else {
                            _ServiceErrorMessage = self.reponseError_.call(self, response);
                            deferred.resolve(_ServiceErrorMessage);
                        }
                    })['catch'](function (response) {
                        modalInstance.dismiss('cancel');
                        _ServiceErrorMessage = self.reponseError_.call(self, response);
                        deferred.reject(_ServiceErrorMessage);
                    });
                }

                return deferred.promise;

            },
            /**
             * @ngdoc method
             * @name setResponseData_
             * @methodOf pdr.core.ProviderModelFactory
             * @returns {*} The instance
             * @protected
             */
            'setResponseData_': function () {
                var response = this.getResponse.call(this);
                this._properties.responseData = (angular.isObject(response) && response.hasOwnProperty('data') ? response.data : null);

                return this;
            },
            /**
             * @ngdoc method
             * @name reponseError_
             * @methodOf pdr.core.ProviderModelFactory
             * @returns {String} the error message
             * @protected
             */
            'reponseError_': function (response) {

                var hasInvalidServerError = function (response) {
                    if (!response.error && !response.errorCode && !response.errorMessage) {
                        return true;
                    } else if (response.error) {
                        if (!response.error.code && !response.error.userMessage) {
                            return true;
                        }
                    }
                    return false;
                };

                try {
                    if (angular.isObject(response) && response.hasOwnProperty('data') && angular.isObject(response.data) && hasInvalidServerError(response.data))
                        throw error;

                    return (response.data.errorCode || response.data.error.code) + ": " + (response.data.errorMessage || response.data.error.userMessage);
                } catch (ex) {
                    return this.config.ErrorMessage;
                }
            },
            /**
             * @ngdoc method
             * @name isValidResponse_
             * @methodOf pdr.core.ProviderModelFactory
             * @returns {Boolean} true
             * @protected
             */
            'isValidResponse_': function () {
                return true;
            },
            /**
             * @ngdoc method
             * @name _setResponse
             * @methodOf pdr.core.ProviderModelFactory
             * @returns {*} The instance
             * @private
             */
            '_setResponse': function (response) {
                this._properties.response = response;
                return this;
            },
            /**
             * @ngdoc method
             * @name _handleCallServiceResponse
             * @methodOf pdr.core.ProviderModelFactory
             * @returns {Boolean} resolve
             * @private
             */
            '_handleCallServiceResponse': function (response) {
                var resolve = false;
                if (angular.isObject(response)) {
                    this._setResponse.call(this, response);
                    if (this.isValidResponse_.call(this)) {
                        this.setResponseData_.call(this);
                        resolve = true;
                    }
                }
                return resolve;
            }
        };

        return Model;

    }
})();


(function () {
    'use strict';
    describe('Service: ProviderModelFactory', function () {
        var service,
            config = {
                'ServiceEndpoint': 'public/app/data/stub/status-reponse-all-open.json',
                'ErrorMessage': 'PTPPDM-: Temporarily unable to retrieve facility information. Please try again later.'
            };

        var response200 = {
            "success": true,
            "error": null,
            "data": {
                "prNumber": "PR-123456",
                "ptpMPIN": "1234567890",
                "ptpTIN": "1234567890",
                "woStatusToPtp": [
                    {
                        "pyID": 1001,
                        "pyStatusWork": "Closed",
                        "prCreateDateTime": "01/05/16",
                        "ReferenceNumber": "PR-123456",
                        "DisclosureMasterId": 1001,
                        "submitterName": "Carol Appleton"
                    }
                ]
            }
        };

        var response500 = {
            "errorCode": 'PTPPDM12345',
            'errorMessage': 'Temporarily unable to retrieve facility information. Please try again later.'
        };

        var response400 = {
            "success": true,
            "error": null,
            "data": {
                "prNumber": "",
                "ptpMPIN": "1234567890",
                "ptpTIN": "1234567890",
                "woStatusToPtp": []
            }
        };


        beforeEach(module('pdr'));

        beforeEach(inject(function (_ProviderModelFactory_) {
            service = _ProviderModelFactory_;
        }));


        describe('getResponse', function () {
            it('should return null', function () {
                var model = new service(config);
                var result = model.getResponse();
                expect(result).toBeNull();
            });
        });

        describe('getResponseData', function () {
            it('should return null', function () {
                var model = new service(config);
                var result = model.getResponseData();
                expect(result).toBeNull();
            });
        });

        describe('resetServiceProperties', function () {
            it('should set response and response data to null', function () {
                var model = new service(config);
                model.resetServiceProperties();
                expect(model.getResponse()).toBeNull();
                expect(model.getResponseData()).toBeNull();
            });

            it('should return the instance of itself', function () {
                var model = new service(config);
                var result = model.resetServiceProperties();
                expect(result).toEqual(model);
                expect(result === model).toBeTruthy();
            });

        });

        describe('reponseError_', function () {
            /*
            it('should return errorCode and errorMessage from the response', function () {
                var model = new service(config);
                var result = model.reponseError_(response500);
                expect(result).toEqual(response500.errorCode + ": " + response500.errorMessage);
            });       */

            it('should return the config error message when response does not have an error message', function () {
                var model = new service(config);
                var result = model.reponseError_(response200);
                expect(result).toEqual(config.ErrorMessage);
            });
        });

        describe('isValidResponse_', function () {
            it('should return true', function () {
                var model = new service(config);
                var result = model.isValidResponse_();
                expect(result).toEqual(true);
            });
        });

        describe('_setResponse', function () {
            it('should return the properties of the response', function () {
                var model = new service(config);
                model._setResponse(response200);
                expect(model.getResponse()).toEqual(response200);
            });
        });

        describe('_handleCallServiceResponse', function () {
            it('should return false if the response is not an object', function () {
                var model = new service(config);
                var result = model._handleCallServiceResponse(null);
                expect(result).toEqual(false);
            });
            it('should return true if the response is an object', function () {
                var model = new service(config);
                var result = model._handleCallServiceResponse(response200);
                expect(result).toEqual(true);
            });
        });


        /* TODO: create callService test */


    });
})();
