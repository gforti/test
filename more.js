(function () {
    'use strict';

    angular
        .module('pdr.widgets')
        .filter('bytesConverter', bytesConverter);

    bytesConverter.$inject = [];

    function bytesConverter() {
        return function(bytes, precision) {
            if ( bytes === 0 ) return '0.0 bytes';
            if ( isNaN(parseFloat(bytes)) || !isFinite(bytes) ) return 'unknown';
            precision = precision || 0;
            var units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB'],
                number = Math.floor(Math.log(bytes) / Math.log(1024)),
                result = Math.pow(1024, Math.floor(number));
            result = ( bytes / result );
            return ( precision > 0 ? result.toFixed(precision) : parseInt(result, 10) ) +  ' ' + units[number];
        };
    }
})();


(function () {
    'use strict';

    angular
        .module('pdr.widgets')
        .directive('fileUploadMaxSize', fileUploadMaxSize);

    fileUploadMaxSize.$inject = ['FileUploadService'];

    /* @ngInject */
    function fileUploadMaxSize(FileUploadService) {

        var directive = {
            link: link,
            require: 'ngModel',
            restrict: 'A'
        };
        return directive;

        function link(scope, element, attrs, ngModelCtrl) {


            element.bind('change', validateFileSize);

            /* Whether the current state is valid (true) or invalid (false). */
            function validateFileSize(e){
                var totalFileSizeBytes = FileUploadService.getAllFileSizeInBytes(this);
                attrs.fileUploadMaxSize = attrs.fileUploadMaxSize || '26214400'; /* 25mb */
                var isValid = !!( parseInt(attrs.fileUploadMaxSize, 10) > totalFileSizeBytes);
                ngModelCtrl.$setValidity('fileUploadMaxSize', isValid);
                scope.$apply();
            }

        }

    }
})();

(function () {
    'use strict';

    /**
     * @ngdoc directive
     * @name pdr.widgets:fileUpload
     * @restrict EA
     * @element
     *
     * @description
     *
     * @example
     <example module="pdr.widgets">
     <div data-file-upload=""></div>
     </example>
     *
     */

    angular
        .module('pdr.widgets')
        .directive('fileUpload', FileUpload);

    FileUpload.$inject = ['FileUploadService'];

    function FileUpload(FileUploadService) {
        var directive = {
            'scope': {
                'fileUploadForm' : '=',
                'inputName' : '@',
                'maxBytesAllowed' : '=?'
            },
            'link': link,
            'templateUrl': 'cache/widgets/file-upload/file-upload.cache.html'
        };
        return directive;

        function link(scope) {
            scope.maxBytesAllowed = scope.maxBytesAllowed || '26214400';
            scope.fileInfo = {};

        }

    }

})();


(function () {
    'use strict';

    angular
        .module('pdr.widgets')
        .directive('fileUploadMaxSize', fileUploadMaxSize);

    fileUploadMaxSize.$inject = ['FileUploadService'];

    /* @ngInject */
    function fileUploadMaxSize(FileUploadService) {

        var directive = {
            link: link,
            require: 'ngModel',
            restrict: 'A'
        };
        return directive;

        function link(scope, element, attrs, ngModelCtrl) {


            element.bind('change', validateFileSize);

            /* Whether the current state is valid (true) or invalid (false). */
            function validateFileSize(e){
                var totalFileSizeBytes = FileUploadService.getAllFileSizeInBytes(this);
                attrs.fileUploadMaxSize = attrs.fileUploadMaxSize || '26214400'; /* 25mb */
                var isValid = !!( parseInt(attrs.fileUploadMaxSize, 10) > totalFileSizeBytes);
                ngModelCtrl.$setValidity('fileUploadMaxSize', isValid);
                scope.$apply();
            }

        }

    }
})();


(function () {
    'use strict';

    /**
     * @ngdoc service
     * @name pdr.widgets.FileUploadService
     * @description Provides a service for widgets
     */

    angular
        .module('pdr.widgets')
        .factory('FileUploadService', FileUploadService);

    FileUploadService.$inject = [];

    /* @ngInject */
    function FileUploadService() {

        var service = {
            'getAllFileSizeInBytes' : getAllFileSizeInBytes,
            'getAllFilesSelected' : getAllFilesSelected,
            'getAllFilesSelectedObject' : getAllFilesSelectedObject
        };

        return service;

        ////////////////


        /**
         * @ngdoc method
         * @name sampleMethod
         * @methodOf pdr.widgets.FileUploadService
         * @param {string} your param need
         * @param {string=} An optional string.
         * @returns {*} The instance
         */
        function getAllFileSizeInBytes(element) {
            var totalFileSizeBytes = 0;

            if ( element && element.files ) {
                for (var i= 0, l = element.files.length ; i < l; i++){
                    totalFileSizeBytes += element.files[i].size;
                }
            }

            return totalFileSizeBytes;
        }

        /* E9 doesn't support multiple input file. */
        function getAllFilesSelected(element) {
            var selectedFiles = [];

            if ( element ) {
                if ( element.files ) {
                    for (var i= 0, l = element.files.length ; i < l; i++){
                        selectedFiles.push(element.files[i].name);
                    }
                } else if ( element.value && element.value.length ) {
                    selectedFiles.push(element.value.split(/(\\|\/)/g).pop());
                }
            }

            return selectedFiles;
        }

        /* E9 doesn't support multiple input file. */
        function getAllFilesSelectedObject(element) {
            var selectedFiles = [];

            if ( element ) {
                if ( element.files && element.files.length ) {
                    for (var i= 0, l = element.files.length ; i < l; i++){
                        selectedFiles.push({
                            'name' : element.files[i].name,
                            'size' : element.files[i].size,
                            'type' : element.files[i].type,
                            'ext' :  element.files[i].name.split('.').pop()
                        });


                    }
                } else if ( element.value && element.value.length ) {
                    selectedFiles.push({
                        'name' : element.value.split(/(\\|\/)/g).pop(),
                        'size' : 'unknown',
                        'type' : '',
                        'ext' :  element.value.split('.').pop()
                    });
                }
            }

            return selectedFiles;
        }

    }
})();


(function () {
    'use strict';

    angular
        .module('pdr.widgets')
        .directive('getFileUploadInfo', getFileUploadInfo);

    getFileUploadInfo.$inject = ['FileUploadService'];

    /* @ngInject */
    function getFileUploadInfo(FileUploadService) {

        var directive = {
            link: link,
            restrict: 'A'
        };
        return directive;

        function link(scope, element, attrs) {

            element.bind('change', fileUploadInfo);

            function fileUploadInfo(e){
                scope[attrs.getFileUploadInfo] = {
                    'selectedFiles' : FileUploadService.getAllFilesSelectedObject(this),
                    'totalFileSizeBytes' : FileUploadService.getAllFileSizeInBytes(this)
                };

                scope.$apply();
            }

        }

    }
})();
