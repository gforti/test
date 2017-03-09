(function () {
    'use strict';


    /**
     * @ngdoc directive
     * @name pdr.core:scrollToIf
     * @restrict EA
     * @element
     *
     * @description
     *
     * @example
     <example module="pdr.widgets">
     <div scroll-to-if="vm.showContext">
        <div>Context to scroll too</div>
     </div>
     </example>
     *
     */

    angular
        .module('pdr.core')
        .directive('scrollToIf', scrollToIf);

    scrollToIf.$inject = ['$window', '$timeout'];

    /* @ngInject */
    function scrollToIf($window, $timeout) {

        var directive = {
            link: link
        };
        return directive;

        function link(scope, element, attrs) {

            var elem = element[0], promise;

            function getEndPos() {
                var rect = elem.getBoundingClientRect();
                return parseInt(rect.top, 10);
            }

            function isElementInViewport (el) {

                var rect = el.getBoundingClientRect();
                return (
                    rect.top >= 0 &&
                    rect.bottom <= angular.element($window).height() /*or $(window).width() */
                );
            }

            function scrollAnimate() {
                var startPos = $window.pageYOffset,
                    endPos = getEndPos(),
                    scrollBy = parseInt((endPos - startPos) / 10, 10); // linear easing

                if ( angular.isUndefined(startPos) ) {
                    scrollBy = 0;
                    $window.scrollTo(0, endPos);
                }

                if ( isElementInViewport(elem) ) {
                    scrollBy *=3;
                    $window.scrollBy(0, scrollBy);
                    scrollBy = 0;
                }

                $window.scrollBy(0, scrollBy);

                if ( scrollBy !== 0
                    || ( scrollBy < 0 && (startPos >= endPos) )
                    || ( scrollBy > 0 && (startPos <= endPos) )
                    ) {
                    promise = $timeout(scrollAnimate);
                } else {
                    $timeout.cancel(promise);
                }

            }

            scope.$watch(attrs.scrollToIf, function(value) {
                if (value) {
                    scrollAnimate();
                }
            });

        }
    }

})();



(function () {
    'use strict';

    angular
        .module('pdr.core')
        .directive('updateModelOnBlur', updateModelOnBlur);

    /* @ngInject */
    function updateModelOnBlur() {

        var directive = {
            link: link,
            require: 'ngModel',
            priority: 1, /* needed for angular 1.2.x */
            restrict: 'A'
        };


        return directive;

        /* override the default input to update on blur */
        function link(scope, element, attrs, ngModelCtrl) {
            if (attrs.type === 'radio' || attrs.type === 'checkbox') { return; }

            element
                .unbind('input')
                .unbind('keydown')
                .unbind('change')
                .bind('blur', update);

            function update() {
                scope.$apply(function () {
                    ngModelCtrl.$setViewValue(element.val());
                });
            }

        }
    }
})();


(function () {
    'use strict';

    angular
        .module('pdr.core')
        .directive('dateInputFormat', dateInputFormat);

    dateInputFormat.$inject = ['SharedDateService'];

    /* @ngInject */
    function dateInputFormat(SharedDateService) {

        var directive = {
            link: link,
            require: 'ngModel',
            priority: 2, /* needed for directive updateModelOnBlur*/
            restrict: 'A'
        };
        return directive;

        function link(scope, element, attrs, ngModelCtrl) {

            /* The $parsers fire when input is sent from the DOM to the model. I needed to add $formatters, which sends data from the model to the DOM. */
            ngModelCtrl.$parsers.unshift(format); /* (view to model) */
            ngModelCtrl.$formatters.unshift(format); /* (model to view) */

            if ( attrs.hasOwnProperty('updateModelOnBlur') ){
                element.bind('keyup', formatInput);
            }

            /* Whether the current state is valid (true) or invalid (false). */
            function format(viewValue){
                viewValue = SharedDateService.formatInputDate(viewValue || '');
                element.val(viewValue);
                return viewValue;
            }

            function formatInput(e) {
                if (e.keyCode !== 8) {
                    format( element.val() );
                }
            }

        }
    }
})();


(function () {
    'use strict';

    angular
        .module('pdr.core')
        .directive('webAddressValidation', webAddressValidation);

    webAddressValidation.$inject = [];

    /* @ngInject */
    function webAddressValidation() {

        var directive = {
            link: link,
            require: 'ngModel',
            restrict: 'A'
        };
        return directive;

        function link(scope, element, attrs, ngModelCtrl) {
            if (!ngModelCtrl) return;

            var expressionEvaluation = false;

            scope.$watch(attrs.webAddressValidation, function webAddressValidationWatchAction(value) {
                expressionEvaluation = value;
                validateWebAddress(ngModelCtrl.$viewValue);
            })

            ngModelCtrl.$parsers.unshift(validateWebAddress); /* (view to model) */
            ngModelCtrl.$formatters.unshift(validateWebAddress); /* (model to view) */

            /* Whether the current state is valid (true) or invalid (false). */
            function validateWebAddress(viewValue) {
                var viewValue = viewValue || '';

                var reg = /^((ftp|http|https|HTTP|HTTPS):\/\/)?([a-zA-Z0-9]+(\.[a-zA-Z0-9]+)+.*)$/;
                var isValid = !!(!viewValue.length ? true : reg.test(viewValue));

                ngModelCtrl.$setValidity('webAddressValidation', expressionEvaluation ? isValid : true);

                return viewValue;
            }

        }
    }
})();


(function () {
    'use strict';

    angular
        .module('pdr.core')
        .directive('dateValidation', dateValidation);

    dateValidation.$inject = ['SharedDateService'];

    /* @ngInject */
    function dateValidation(SharedDateService) {

        var directive = {
            link: link,
            require: 'ngModel',
            restrict: 'A'
        };
        return directive;

        function link(scope, element, attrs, ngModelCtrl) {

            ngModelCtrl.$parsers.unshift(validateDate); /* (view to model) */
            ngModelCtrl.$formatters.unshift(validateDate); /* (model to view) */

            /* Whether the current state is valid (true) or invalid (false). */
            function validateDate(viewValue){
                viewValue = viewValue || '';
                var isValid = !!( !viewValue.length ? true : SharedDateService.isRealDateValid(viewValue) );
                ngModelCtrl.$setValidity('dateValidation', isValid);
                return ( isValid ? viewValue : undefined );
            }

        }
    }
})();



(function () {
    'use strict';

    angular
        .module('pdr.core')
        .factory('SharedDateService', SharedDateService);

    SharedDateService.$inject = [];

    /* @ngInject */
    function SharedDateService() {

        var SharedConfig = {
            'Regex': {
                'Dates': {
                    'Real': {
                        'US': /^(?:(?:(?:0?[13578]|1[02])(\/|-|\.)31)\1|(?:(?:0?[1,3-9]|1[0-2])(\/|-|\.)(?:29|30)\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:0?2(\/|-|\.)29\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:(?:0?[1-9])|(?:1[0-2]))(\/|-|\.)(?:0?[1-9]|1\d|2[0-8])\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/
                    },
                    'Formats': {
                        'US': /^(\d{1,2})[- /.](\d{1,2})[- /.](\d{4,})+$/, /* mm-dd-yyyy+ */
                        'EUR': /^(\d{4,})[- /.](\d{1,2})[- /.](\d{1,2})+$/ /* yyyy+-mm-dd */
                    }
                }
            }
        };

        var service = {
            'formatDateToUS': formatDateToUS,
            'isDateValid': isDateValid,
            'isRealDateValid': isRealDateValid,
            'getDateFormat': getDateFormat,
            'isValidBirthDate': isValidBirthDate,
            'isDateGreaterThan': isDateGreaterThan,
            'isDateLessThan': isDateLessThan,
            'isEarliestAllowedDate': isEarliestAllowedDate,
            'formatInputDate': formatInputDate,
            'formatDateToNumericEUR' : formatDateToNumericEUR
        };

        return service;

        function formatDateToNumericEUR(date) {
            var value = getDateString(date);
            return ( angular.isString(value) ? value.replace(/[-]/g, '') : value );
        }

        function getDateString(value) {
            /* Format the date to be Y-m-d before putting the string into a new Date, to avoid timezone issues */
            if ( angular.isString(value) && SharedConfig.Regex.Dates.Real.US.test(value) ) {
                value = value.replace(SharedConfig.Regex.Dates.Formats.US, '$3-$1-$2');
            }
            return ( angular.isDate(value) ? value.toISOString().split('T')[0] : value );
        }

        function formatInputDate(value) {

            value = formatDateToUS(value);

            if ( !angular.isString(value) ) return '';

            var numbers = value.replace(/[- .]+/g, '/').replace(/[^0-9- /.]+/g, ''),
                char = {1: '/', 3: '/'};
            value = '';

            var dateDivders = numbers.match(/([/])/g);

            if( dateDivders && dateDivders.length ) {

                var m = numbers.match(/([0-9]+)/g);

                if ( m[0] && dateDivders.length ) {
                    numbers = ( m[0].length === 1 ? '0'+ m[0] : m[0]);
                }

                if ( m[1] && dateDivders.length > 1 ) {
                    numbers += '' + ( m[1].length === 1 ? '0'+ m[1] : m[1]);
                } else if ( m[1] && dateDivders.length === 1 ) {
                    numbers += '' + m[1];
                }

                if ( m[2] ) {
                    numbers += '' + m[2];
                }

            }

            numbers = numbers.replace(/[^0-9]+/g, '');

            for (var i = 0; i < numbers.length; i++) {
                value += numbers[i] + (char[i] || '');
            }



            return value;
        }


        function formatDateToUS(date) {

            date = getDateString(date);

            if (!isDateValid(date)
            ) return date;

            var returnValue = date,
                format = getDateFormat(date);

            if (format === 'EUR') {
                returnValue = date.replace(SharedConfig.Regex.Dates.Formats.EUR, '$2/$3/$1');
            }
            return returnValue;
        }

        function isDateValid(date) {
            return ( getDateFormat(date) !== null ? true : false );
        }


        function isRealDateValid(date) {
            date = formatDateToUS(date);
            return !!( SharedConfig.Regex.Dates.Real.US.test(date) && isDateValid(date) );
        }


        function getDateFormat(date) {

            date = getDateString(date);

            if (!angular.isString(date)
            ) return null;

            for (var format in SharedConfig.Regex.Dates.Formats) {
                if (!SharedConfig.Regex.Dates.Formats.hasOwnProperty(format)) continue;
                if (SharedConfig.Regex.Dates.Formats[format].test(date)) {
                    return format;
                }
            }

            return null;
        }

        /*Assume maxdate is today unless specified otherwise: If the date parameter is valid,
         * then maxDate will be created. If the opt_maxdate parameter is valid, then the
         * maxDate variable is set to it; otherwise it is set to today. The function then returns a boolean:
         * true if the date in question is before maxdate*/
        function isValidBirthDate(date) {
            if (!isRealDateValid(date)
            ) return false;

            var birthDate = new Date(date),
                today = new Date(),
                maxAge = parseInt(today.getFullYear() - 120, 10);

            return !!( birthDate.getFullYear() >= maxAge && birthDate <= today );
        }

        /*
         Pass in two dates and compare them. If the first is smaller than (before) the second, then return false.
         */
        function isDateGreaterThan(minDate, maxDate) {
            //console.log('date-service::minDate: ' + minDate + ' and maxDate:' + maxDate + !!( new Date(minDate) > new Date( maxDate) ));
            if (!isDateValid(minDate) || !isDateValid(maxDate)
            ) return false;

            return !!( new Date(minDate) >= new Date(maxDate) );
        }

        /*
         Pass in two dates and compare them. If the first is smaller than (before) the second, then return true.
         */
        function isDateLessThan(minDate, maxDate) {
            //console.log('date-service::minDate: ' + minDate + ' and maxDate:' + maxDate + ' so  will return ' + !!( new Date(minDate) > new Date( maxDate) ));

            if (!isDateValid(minDate) || !isDateValid(maxDate)
            ) return false;

            return !!( new Date(minDate) <= new Date(maxDate) );
        }

        function isEarliestAllowedDate(date) {
            if (!isDateValid(date)
            ) return false;

            return !!(new Date(date) >= (18).months().ago());
        }
    }
})();


(function () {
    'use strict';

    angular
        .module('pdr.utils')
        .directive('inputDateToIso', inputDateToIso);

    inputDateToIso.$inject = ['dateFilter'];

    /* @ngInject */
    function inputDateToIso(dateFilter) {

        var directive = {
            link: link,
            require: 'ngModel',
            restrict: 'A',
            priority: -1
        };
        return directive;

        function link(scope, element, attrs, ngModelCtrl) {

            ngModelCtrl.$parsers.push(validateDateOfBirth); /* (view to model) */
            ngModelCtrl.$formatters.push(validateDateOfBirth); /* ( model to view) */


            /* check to make it is a valid date  */
            function validateDateOfBirth(viewValue){
                    viewValue = viewValue || '';
                //viewValue =  ( angular.isDate(viewValue) ? viewValue.toISOString().split('T')[0] : viewValue );
               if(angular.isString(viewValue)) {
                   viewValue = viewValue.replace(/[^0-9- /.]+/g, '');
                   element.val(viewValue);
               }
                return viewValue;
            }
        }

    }
})();



(function () {
    'use strict';

    angular
        .module('pdr.core')
        .directive('requestNumberInputFormat', requestNumberInputFormat);

    requestNumberInputFormat.$inject = [];

    /* @ngInject */
    function requestNumberInputFormat() {

        var directive = {
            link: link,
            require: 'ngModel',
            priority: 2, /* needed for directive updateModelOnBlur*/
            restrict: 'A'
        };
        return directive;

        function link(scope, element, attrs, ngModelCtrl) {

            /* The $parsers fire when input is sent from the DOM to the model. I needed to add $formatters, which sends data from the model to the DOM. */
            ngModelCtrl.$parsers.unshift(format); /* (view to model) */
            ngModelCtrl.$formatters.unshift(format); /* (model to view) */

            if ( attrs.hasOwnProperty('updateModelOnBlur') ){
                element.bind('keyup', formatInput);
            }

            /* Whether the current state is valid (true) or invalid (false). */
            function format(viewValue){
                viewValue = formatInputValue(viewValue || '');
                element.val(viewValue);
                return viewValue;
            }

            function formatInput(e) {
                if (e.keyCode !== 8) {
                    format( element.val() );
                }
            }

            function formatInputValue(value) {
                if ( !angular.isString(value) ) return '';
                var newValue = '';
                var numbers = value.replace(/[^0-9]+/g, '').slice(0,20); /* PhyCon Docs V2.0 */
                if( /^(PR|RS)$/.test(value) ) {
                    newValue = '';
                } else if ( /^[p|P]$/.test(value) ) {
                    newValue = 'PR-';
                } else if ( /^[r|R]$/.test(value) ) {
                    newValue = 'RS-';
                }

                if ( numbers.length ) {
                    newValue = ( /^(RS-)/.test(value) ? 'RS-' : 'PR-' );
                }
                return newValue + numbers;
            }

        }
    }
})();


(function () {
    'use strict';

    angular
        .module('pdr.core')
        .directive('requestNumberValidation', requestNumberValidation);

    requestNumberValidation.$inject = [];

    /* @ngInject */
    function requestNumberValidation() {

        var directive = {
            link: link,
            require: 'ngModel',
            restrict: 'A'
        };
        return directive;

        function link(scope, element, attrs, ngModelCtrl) {

            ngModelCtrl.$parsers.unshift(validateRequestNumber); /* (view to model) */
            ngModelCtrl.$formatters.unshift(validateRequestNumber); /* (model to view) */

            /* Whether the current state is valid (true) or invalid (false). */
            function validateRequestNumber(viewValue){
                viewValue = viewValue || '';
                var reg = /^((PR|RS)-[0-9]{1,20})$/;
                var isValid = !!( reg.test(viewValue) );
                ngModelCtrl.$setValidity('requestNumberValidation', isValid);
                return ( isValid ? viewValue : undefined );
            }

        }

    }
})();
