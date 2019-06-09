angular.module('appModule').service('homeService', ['$http', function($http){
    let serverUrl = 'http://localhost:4000/';
    this.threeRandomPOI = function () {
        return $http.get(serverUrl + 'threeRandomPOI');
    };
    this.getPOIinfo = function (data) {
        return $http.get(serverUrl + 'GetPOIInformation/' + data);
    };

}]).controller('homePageController', ['$scope', 'homeService', '$route', '$location', 'localStorageModel', 'setTokenService',
    function ($scope, homeService, $route, $location, localStorageModel, setTokenService) {

    let vm = this;
    vm.threePOIs = undefined;
    vm.poiInfo = undefined;
    vm.getPOIinformation = getPOIinformation;


    checkLocalStorage();
    loadThreePOIs();



    function loadThreePOIs(){
        homeService.threeRandomPOI().then(function (response){

            vm.threePOIs = response.data;
        })
    }

    function checkLocalStorage(){
        let token = localStorageModel.get('token');
        if (token){
            setTokenService.set(token);
            $scope.$parent.vm.username = localStorageModel.get('username');
            $scope.$parent.vm.userConnected = true;
            $location.path('/userHomePage');
        }
    }

    function getPOIinformation(poi){
        $location.path('/POIinformation/' + poi['poiId']);

    }


}]);

