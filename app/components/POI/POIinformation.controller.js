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
    this.saveCritic = function (data) {
        return $http.post(serverUrl + 'loggedIn/user/saveCritic', data);
    };
    this.getSavedPOI = function (data) {
        return $http.get(serverUrl + 'loggedIn/user/getUserSavedPOIs/' + data)
    };

}]).controller('POIinformationController', ['poiService', '$location', '$routeParams', 'toastr', '$scope', 'localStorageModel',  'setTokenService',
    function (poiService, $location, $routeParams, toastr, $scope, localStorageModel,setTokenService) {

        let vm = this;
        vm.poiInfo = undefined;
        vm.percentageRank = undefined;
        vm.criticDate = [];
        vm.poiId = parseInt($routeParams.id);
        vm.userId = localStorageModel.get('userId');
        vm.isUserConnected = $scope.$parent.vm.userConnected;
        vm.dataCritic = undefined;
        vm.loadFirstCritic = false;
        vm.loadSecondCritic = false;
        vm.rank = undefined;
        vm.criticText = undefined;
        vm.isSaved = isSaved;
        vm.addToFavorites = addToFavorites;
        vm.removeFromFavorites = removeFromFavorites;
        vm.saveCritic = saveCritic;
        checkLocalStorage();
        getPOIinformation();



        function checkLocalStorage(){
            vm.token = localStorageModel.get('token');
            if (vm.token){
                setTokenService.set(vm.token);
                importSavedPOIs();
                $scope.$parent.vm.username = localStorageModel.get('username');
                $scope.$parent.vm.userConnected = true;
                vm.isUserConnected = $scope.$parent.vm.userConnected;
            }
        }


        function importSavedPOIs(){
            poiService.getSavedPOI(localStorageModel.get('userId')).then(function (response) {
                vm.userFavoritePOIs = response.data;
                for(let i = 0; i < vm.userFavoritePOIs.length; i++){
                    $scope.$parent.vm.parentAddToFavorites(vm.userFavoritePOIs[i].poiId);
                }
            });
        }

        function saveCritic() {
            if(vm.rank >= 1 && vm.rank <= 5)
            {
                vm.dataCritic =
                    {
                        'userID': vm.userId,
                        'poiID': vm.poiId,
                        'critic_text': vm.criticText.toString(),
                        'rank': parseInt(vm.rank.toString())
                    };

                poiService.saveCritic(vm.dataCritic).then(function() {
                    toastr.success("Your critic was saved");
                    getPOIinformation();
                })
            }
            else
                toastr.error("One opf your inputs is wrong");
        }


        function getPOIinformation() {
            poiService.getPOIinfo(vm.poiId).then(function (response) {
                vm.poiInfo = response.data;
                vm.percentageRank = parseFloat(vm.poiInfo[0][0]['rank']) / 5 * 100;
                if (vm.poiInfo[1][0] !== undefined) {
                    vm.loadFirstCritic = true;
                    vm.criticDate[0] = vm.poiInfo[1][0]['criticDate'].substring(0, 10);
                }
                if (vm.poiInfo[1][1] !== undefined) {
                    vm.loadSecondCritic = true;
                    vm.criticDate[1] = vm.poiInfo[1][1]['criticDate'].substring(0, 10);
                }


            })
        }

        function isSaved(poiId) {
            return $scope.$parent.vm.existsInFavorites(poiId);
        }

        function addToFavorites(poiId) {
            if($scope.$parent.vm.userConnected)
            {
                vm.dataToAddPOI =
                    {
                        'userId': vm.userId,
                        'poiId': poiId
                    };
                poiService.addToFavor(vm.dataToAddPOI).then(function () {
                    toastr.success("You got " + ($scope.$parent.vm.savedPOIs.length + 1) + " favorite Points of Interest now!");
                    $scope.$parent.vm.parentAddToFavorites(poiId);
                }, function () {
                    toastr.error("Adding new favorite POI failed");
                });
            }
        }

        function removeFromFavorites(poiId) {
            vm.dataToRemovePOI =
                {
                    'userId': vm.userId,
                    'poiId': poiId
                };

            poiService.removeFromFavor(vm.dataToRemovePOI).then(function () {
                $scope.$parent.vm.parentRemoveFromFavorites(poiId);
            });
        }
    }

]);
