angular.module('appModule').service('poiService', ['$http', function ($http) {
    let serverUrl = 'http://localhost:4000/';

    this.getPOIinfo = function (data) {
        return $http.get(serverUrl + 'GetPOIInformation/' + data);
    };
    this.addToFavor = function (data) {
        return $http.post(serverUrl + 'loggedIn/user/SavePOI', data);
    };
    this.removeFromFavor = function (data) {
        return $http.post(serverUrl + 'loggedIn/user/DeleteSavedPOI', data);
    };

}]).controller('POIinformationController', ['poiService', '$location', '$routeParams', 'toastr', '$scope', 'localStorageModel',
    function (poiService, $location, $routeParams, toastr, $scope, localStorageModel) {

    let vm = this;
    vm.poiInfo = undefined;
    vm.percentageRank = undefined;
    vm.criticDate = [];
    vm.poiId = parseInt($routeParams.id);
    vm.userId = localStorageModel.get('userId');
    vm.isSaved = isSaved;
    vm.addToFavorites = addToFavorites;
    vm.removeFromFavorites = removeFromFavorites;

    getPOIinformation();


    function getPOIinformation() {
        poiService.getPOIinfo(vm.poiId).then(function (response) {
            vm.poiInfo = response.data;
            vm.percentageRank = parseInt(vm.poiInfo[0][0]['rank'])/5 * 100;
          //  vm.criticDate[0] = vm.poiInfo[1][0]['criticDate'].substring(0, 10);
          //  vm.criticDate[1] = vm.poiInfo[1][1]['criticDate'].substring(0, 10);

        })
    }

    function isSaved(poiId){
        return $scope.$parent.vm.existsInFavorites(poiId);
    }

    function addToFavorites(poiId){
        vm.dataToAddPOI =
            {
                'userId' : vm.userId,
                'poiId' : poiId
            };
        poiService.addToFavor(vm.dataToAddPOI).then(function () {
        toastr.success("You got " + ($scope.$parent.vm.savedPOIs.length + 1) + " favorite Points of Interest now!");
        $scope.$parent.vm.addToFavorites(poiId);
        },function () {
            toastr.error("Adding new favorite POI failed");
        });

    }

    function removeFromFavorites(poiId){
        vm.dataToRemovePOI =
            {
                'userId' : vm.userId,
                'poiId' : poiId
            };

        poiService.removeFromFavor(vm.dataToRemovePOI).then(function () {
        $scope.$parent.vm.removeFromFavorites(poiId);
        });
    }
}]);


