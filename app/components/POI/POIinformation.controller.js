angular.module('appModule').service('POIinformationService', ['$http', function($http){
    let serverUrl = 'http://localhost:4000/';

    this.getPOIinfo = function (data) {
        return $http.get(serverUrl + 'GetPOIInformation/' + data);
    };

}]).controller('POIinformationController', ['$route', function($route)
{
    let vm = this;
    vm.poi = undefined;
    start();

    function start(){
        vm.poi = $route.routes['/POIinformation'].poi;
        getPOIinformation(vm.poi);
    }

    function getPOIinformation(poi){
            POIinformationService.getPOIinfo(poi['poiId']).then(function (response) {
            vm.poiInfo = response.data;
            alert(vm.poiInfo[0][0]['poiName']);
        })
    }
}]);


