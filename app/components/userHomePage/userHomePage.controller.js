angular.module('appModule').service('userHomeService', ['$http', function($http){
    let serverUrl = 'http://localhost:4000/loggedIn/user/';
    this.getTwoLastSavedPOI = function (data) {
        return $http.get(serverUrl + 'getTwoLastSavedPOI/' + data );
    };
    this.getTwoRecommendedPOI = function (data) {
        return $http.get(serverUrl + 'getTwoRecommendedPOI/' + data);
    };
    this.getPOIinfo = function (data) {
        return $http.get(serverUrl + 'GetPOIInformation/' + data);
    };

}]).controller('userHomePageController', ['$scope', 'userHomeService', '$route', '$location', 'localStorageModel', 'toastr',
    function ($scope, userHomeService, $route, $location, localStorageModel, toastr) {

        let vm = this;
        vm.userId = localStorageModel.get('userId');
        vm.username = localStorageModel.get('username');
        vm.importAllData = false;
        vm.importSavedPOIs = false;
        vm.importRecommendedPOIs = false;
        vm.userSavedPOIs = undefined;
        vm.userRecommendedPOIs = undefined;
        vm.getPOIinformation = getPOIinformation;

        loadSavedPOIs();
        loadRecommendedPOIs();

        function loadSavedPOIs() {
            userHomeService.getTwoLastSavedPOI(vm.userId).then( function (response){
               vm.userSavedPOIs = response.data;
               vm.importSavedPOIs = true;
               vm.importAllData = vm.importSavedPOIs && vm.importRecommendedPOIs;

            }, function (response) {
                toastr.error('We recommend to save points of interest to favorite list by clicking on star button');
                console.log(response);

            });
        }

        function loadRecommendedPOIs() {
            userHomeService.getTwoRecommendedPOI(vm.userId).then( function (response){
                vm.userRecommendedPOIs = response.data;
                vm.importRecommendedPOIs = true;
                vm.importAllData = vm.importSavedPOIs && vm.importRecommendedPOIs;

            }, function (response) {
                toastr.error('Failed to import data from DB');
                console.log(response);

            });
        }

        function getPOIinformation(poi){
            $location.path('/POIinformation/' + poi['poiId']);

        }


    }]);

