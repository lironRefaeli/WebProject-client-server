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
    this.addToFavor = function (data) {
        return $http.post(serverUrl + 'SavePOI', data);
    };
    this.removeFromFavor = function (data) {
        return $http.post(serverUrl + 'DeleteSavedPOI', data);
    };

}]).controller('userHomePageController', ['$scope', 'userHomeService', '$route', '$location', 'localStorageModel', 'toastr', 'setTokenService',
    function ($scope, userHomeService, $route, $location, localStorageModel, toastr, setTokenService) {

        let vm = this;
        vm.userId = localStorageModel.get('userId');
        vm.username = localStorageModel.get('username');
        vm.importAllData = false;
        vm.importSavedPOIs = false;
        vm.importRecommendedPOIs = false;
        vm.userSavedPOIs = undefined;
        vm.userRecommendedPOIs = undefined;
        vm.getPOIinformation = getPOIinformation;
        vm.isSaved = isSaved;
        vm.addToFavorites = addToFavorites;
        vm.removeFromFavorites = removeFromFavorites;
        checkLocalStorage();
        loadSavedPOIs();
        loadRecommendedPOIs();

        function isSaved(poi){
            return $scope.$parent.vm.existsInFavorites(poi.poiId);
        }

        function addToFavorites(poiId){
            vm.dataToAddPOI =
                {
                    'userId' : vm.userId,
                    'poiId' : poiId
                };
            userHomeService.addToFavor(vm.dataToAddPOI).then(function () {
                toastr.success("Added new POI to your favorites!");
                    loadSavedPOIs();
                $scope.$parent.vm.addToFavorites(poiId);
                isSaved(poi);
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

            userHomeService.removeFromFavor(vm.dataToRemovePOI).then(function () {
                toastr.success("POI was deleted from your favorites");
                    loadSavedPOIs();
                $scope.$parent.vm.removeFromFavorites(poiId);
                isSaved(poi);
            },function () {
                toastr.error("Deleting the POI from favorites failed");
            });
        }

        function loadSavedPOIs() {
            userHomeService.getTwoLastSavedPOI(vm.userId).then( function (response){
               vm.userSavedPOIs = response.data;
               vm.importSavedPOIs = true;
               vm.importAllData = vm.importSavedPOIs && vm.importRecommendedPOIs;

            }, function (response) {
                vm.importSavedPOIs = false;
                toastr.info('We recommend to save points of interest to favorite list by clicking on star button');
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

        function checkLocalStorage(){
            let token = localStorageModel.get('token');
            if (token){
                setTokenService.set(token);
                $scope.$parent.vm.username = localStorageModel.get('username');
                $scope.$parent.vm.userConnected = true;
            }
            else
                $location.path('/');
        }


    }]);

