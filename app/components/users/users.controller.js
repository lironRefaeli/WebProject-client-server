angular.module('appModule').service('usersService', ['$http', function ($http) {
    let serverUrl = 'http://localhost:4000/';
    this.register = function (data) {
        return $http.post(serverUrl + 'register', data);
    };
    this.login = function (data) {
        return $http.post(serverUrl + 'login', data);
    };
    this.passRetrieval = function (data) {
        return $http.post(serverUrl + 'passRetrieval', data);
    };
    this.getCategories = function () {
        return $http.get(serverUrl + 'getCategories')
    };
    this.getCountries = function () {
        return $http.get(serverUrl + 'getCountries')
    };
    this.getQuestions = function () {
        return $http.get(serverUrl + 'getQuestions')
    };
    this.getUserQuestions = function (data) {
        return $http.get(serverUrl + 'getQuestions/' + data)
    }

}]).controller('usersController', ['toastr', '$location', '$scope', 'usersService', '$mdDialog',
    function (toastr, $location, $scope, usersService, $mdDialog) {

        vm = this;
        vm.importAllData = false;
        vm.importCategories = false;
        vm.importCountries = false;
        vm.importQuestions = false;

        vm.user = undefined;
        vm.loginUser = undefined;
        vm.countries = [];
        vm.questions = [];
        vm.categories = [];

        vm.signUp = signUp;
        vm.restorePassword = restorePassword;
        vm.login = login;
        loadCategories();
        loadCountries();
        loadQuestions();


        function login(){
            usersService.login(vm.loginUser).then(function (response) {
                toastr.success('login Succeeded');
                console.log(response);
                $scope.$parent.vm.userConnected = true;
                $scope.$parent.vm.username = vm.loginUser.username;
                $location.path('/');

            }, function (response) {
                toastr.error('Failed to login. Username or Password are incorrect');
                console.log(response);
            });
        }

        function signUp() {
            if (vm.user.categories['0'] === vm.user.categories['1'] ) {
                toastr.error('You must choose different categories');

            }
            else if(vm.user.questions['0'] === vm.user.questions['1']){
                toastr.error('You must choose different questions');
            }
            else {
                usersService.register(vm.user).then(function (response) {
                    toastr.success('Registration Succeeded');
                    console.log(response);
                    $location.path('/login');

                }, function (response) {
                    toastr.error('Failed to load data from server.');
                    console.log(response);
                });
            }

        }

        function loadCategories() {
            usersService.getCategories().then(function (response) {
                for (let i = 0; i < response.data.length; i++) {
                    vm.categories[i] = response.data[i]['categoryName'];
                }
                vm.importCategories = true;
                vm.importAllData = vm.importCategories && vm.importCountries && vm.importQuestions;
            }, function (response) {
                toastr.error('Failed to load data from server.');
                console.log(response);
            });
        }

        function loadCountries() {
            usersService.getCountries().then(function (response) {
                for (let i = 0; i < response.data.length; i++) {
                    vm.countries[i] = response.data[i]['name'];
                }
                vm.importCountries = true;
                vm.importAllData = vm.importCategories && vm.importCountries && vm.importQuestions;
            }, function (response) {
                toastr.error('Failed to load data from server.');
                console.log(response);
            });
        }

        function loadQuestions() {
            usersService.getQuestions().then(function (response) {
                for (let i = 0; i < response.data.length; i++) {
                    vm.questions[i] = response.data[i]['question'];
                }
                vm.importQuestions = true;
                vm.importAllData = vm.importCategories && vm.importCountries && vm.importQuestions;
            }, function (response) {
                toastr.error('Failed to load data from server.');
                console.log(response);
            });
        }

        function restorePassword() {
            $location.path('/passRetrieval');

        }

    }]);