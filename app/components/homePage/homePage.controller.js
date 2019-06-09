angular.module('appModule').service('homeService', ['$http', function($http){
    let serverUrl = 'http://localhost:4000/';
    this.threeRandomPOI = function () {
        return $http.get(serverUrl + 'threeRandomPOI');
    };
    this.getPOIinfo = function (data) {
        return $http.get(serverUrl + 'GetPOIInformation/' + data);
    };

}]).controller('homePageController', ['$scope', 'homeService', '$route', '$location',
    function ($scope, homeService, $route, $location) {

    let vm = this;
    vm.threePOIs = undefined;
    vm.poiInfo = undefined;
    vm.getPOIinformation = getPOIinformation;
    loadThreePOIs();



    function loadThreePOIs(){
        homeService.threeRandomPOI().then(function (response){

            vm.threePOIs = response.data;
        })
    }

    function getPOIinformation(poi){
        $location.path('/POIinformation/' + poi['poiId']);

    }


}]);

