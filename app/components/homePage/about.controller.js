angular.module('appModule')
    .controller('aboutController', ['$scope', '$location', 'localStorageModel', 'setTokenService',
    function ($scope, $location, localStorageModel, setTokenService) {

        let vm = this;

        checkLocalStorage();

        function checkLocalStorage(){
            let token = localStorageModel.get('token');
            if (token){
                setTokenService.set(token);
                $scope.$parent.vm.username = localStorageModel.get('username');
                $scope.$parent.vm.userConnected = true;
                $location.path('/about');
            }
        }
    }]);
