let app = angular.module('appModule',[])
app.config(['$routeProvider'], function($routeProvider){

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
        })
});