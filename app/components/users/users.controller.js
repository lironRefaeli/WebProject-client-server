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
        return $http.get(serverUrl + 'getUserQuestions/' + data)
    }

}]).controller('usersController', ['toastr', '$location', '$scope', 'usersService', '$mdDialog',
    function (toastr, $location, $scope, usersService, $mdDialog) {

        vm = this;
        vm.importAllData = false;
        vm.importCategories = false;
        vm.importCountries = false;
        vm.importQuestions = false;
        vm.importUserQuestions = false;

        vm.user = undefined;
        vm.loginUser = undefined;
        vm.passRetrivalUser = [];
        vm.userAnswers = [];
        vm.countries = [];
        vm.questions = [];
        vm.categories = [];
        vm.dataForPassRetrivel = [];

        vm.signUp = signUp;
        vm.openPassRetrievalPage = openPassRetrievalPage;
        vm.login = login;
        vm.loadUserQuestions = loadUserQuestions;
        vm.restoreUserPassword = restoreUserPassword;
        loadCategories();
        loadCountries();
        loadQuestions();


        function login() {
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
            if (vm.user.categories['0'] === vm.user.categories['1']) {
                toastr.error('You must choose different categories');

            } else if (vm.user.questions['0'] === vm.user.questions['1']) {
                toastr.error('You must choose different questions');
            } else {
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

        function openPassRetrievalPage() {
            $location.path('/passRetrieval');
        }

        function loadUserQuestions() {
            usersService.getUserQuestions(vm.passRetrivalUser.username).then(function (response) {
                vm.passRetrivalUser = response.data;
                vm.importUserQuestions = true;
            }, function (response) {
                toastr.error('Failed to load data from server.');
                console.log(response);
            });
        }

        function restoreUserPassword() {
            if (vm.userAnswers[0] === vm.passRetrivalUser[0]['answer1'] && vm.userAnswers[1] === vm.passRetrivalUser[0]['answer2']) {

                vm.dataForPassRetrivel.username = vm.passRetrivalUser.username;
                vm.dataForPassRetrivel.questions = [];
                vm.dataForPassRetrivel['questions'][0] = vm.passRetrivalUser[0]['question1'];
                vm.dataForPassRetrivel['questions'][1] = vm.passRetrivalUser[0]['question2'];
                vm.dataForPassRetrivel.answers = [];
                vm.dataForPassRetrivel['answers'][0] = vm.userAnswers[0];
                vm.dataForPassRetrivel['answers'][1] = vm.userAnswers[1];

                usersService.passRetrieval(JSON.parse(vm.dataForPassRetrivel)).then(function (response) {
                toastr.success('Your password is:' + response.data['userPassword']);
                $location.path('/login');

                }, function (response) {
                    toastr.error('Failed to load data from server.');
                    console.log(response);
                });
            } else {
                vm.userAnswers = [];
                toastr.error('One of yours answers is wrong');
            }

        }

    }]);