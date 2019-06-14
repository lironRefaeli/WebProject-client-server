angular.module('appModule').service('poiService', ['$http', function ($http) {
    let serverUrl = 'http://localhost:4000/';

    this.getPOIinfo = function (data) {
        return $http.get(serverUrl + 'GetPOIInformation/' + data);
    };

}]).controller('POIinformationController', ['poiService', '$location', '$routeParams', function (poiService, $location, $routeParams) {

    let vm = this;
    vm.poiInfo = undefined;
    vm.percentageRank = undefined;
    vm.critic = undefined;
    vm.loadFirstCritic = false;
    vm.loadSecondCritic = false;
    vm.criticDate = [];
    getPOIinformation();


    function getPOIinformation() {
        poiService.getPOIinfo($routeParams.id).then(function (response) {
            vm.poiInfo = response.data;
            vm.percentageRank = parseInt(vm.poiInfo[0][0]['rank'])/5 * 100;

            if(vm.poiInfo[1][0] !== undefined )
                vm.loadFirstCritic = true;
            if(vm.poiInfo[1][1]!== undefined )
                vm.loadSecondCritic = true;
            vm.criticDate[0] = vm.poiInfo[1][0]['criticDate'].substring(0, 10);
            vm.criticDate[1] = vm.poiInfo[1][1]['criticDate'].substring(0, 10);

        })
    }
}]);


