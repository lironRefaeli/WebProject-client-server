let app = angular.module('appModule',['toastr',"ngRoute", 'ngMaterial', 'ngMessages','star-rating','ngAnimate', 'ngTouch','md.chips.select','LocalStorageModule'])
app.config(['$locationProvider','toastrConfig', '$routeProvider', function ($locationProvider,toastrConfig, $routeProvider) {

    $locationProvider.hashPrefix('');

    $routeProvider
        .when('/', {
        templateUrl: 'components/homePage/home.html',
        controller: 'homePageController as vm'
        })
        .when('/register', {
        templateUrl: 'components/users/register.html',
        controller: 'usersController as vm'
        })
        .when('/login', {
            templateUrl: 'components/users/login.html',
            controller: 'usersController as vm'
        })
        .when('/passRetrieval', {
            templateUrl: 'components/users/passRetrieval.html',
            controller: 'usersController as vm'
        }).otherwise({redirectTo: '/'});

    angular.extend(toastrConfig, {
        autoDismiss: false,
        containerId: 'toast-container',
        maxOpened: 0,
        newestOnTop: true,
        positionClass:'toast-bottom-right' ,
        preventDuplicates: true,
        preventOpenDuplicates: false,
        progressBar: true,
        target: 'body',
        closeButton: true,

    });
}]);