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
    this.getSavedPOI = function (data) {
        return $http.get(serverUrl + 'getUserSavedPOIs/' + data)
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
                toastr.success("You got " + ($scope.$parent.vm.savedPOIs.length + 1) + " favorite Points of Interest now!");
                loadSavedPOIs();
                $scope.$parent.vm.parentAddToFavorites(poiId);
            });

        }

        function removeFromFavorites(poiId){
            vm.dataToRemovePOI =
                {
                    'userId' : vm.userId,
                    'poiId' : poiId
                };

            userHomeService.removeFromFavor(vm.dataToRemovePOI).then(function () {
                loadSavedPOIs();
                $scope.$parent.vm.parentRemoveFromFavorites(poiId);
            });
        }

        function loadSavedPOIs() {
            userHomeService.getTwoLastSavedPOI(vm.userId).then( function (response){
               vm.userSavedPOIs = response.data;
               if(vm.userSavedPOIs.length < 2){
                   vm.importSavedPOIs = false;
                   toastr.info('We recommend to save points of interest to favorite list by clicking on star button');
               }
               else{
                   vm.importSavedPOIs = true;
                   vm.importAllData = vm.importSavedPOIs && vm.importRecommendedPOIs;
               }
            }, function (response) {
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
            vm.token = localStorageModel.get('token');
            if (vm.token){
                setTokenService.set(vm.token);
                importSavedPOIs();
                $scope.$parent.vm.username = localStorageModel.get('username');
                $scope.$parent.vm.userConnected = true;
            }
            else
                $location.path('/');
        }

        function importSavedPOIs(){
            userHomeService.getSavedPOI(localStorageModel.get('userId')).then(function (response) {
                vm.userFavoritePOIs = response.data;
                for(let i = 0; i < vm.userFavoritePOIs.length; i++){
                    $scope.$parent.vm.parentAddToFavorites(vm.userFavoritePOIs[i].poiId);
                }
            });
        }


    }]);

