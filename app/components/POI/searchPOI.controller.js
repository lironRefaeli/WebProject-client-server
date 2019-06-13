angular.module('appModule').service('searchPoiService', ['$http', function ($http) {
    let serverUrl = 'http://localhost:4000/';

    this.getPOIs = function () {
        return $http.get(serverUrl + 'getPOIs');
    };
    this.getCategories = function () {
        return $http.get(serverUrl + 'getCategories')
    };
    this.addToFavor = function (data) {
        return $http.post(serverUrl + 'loggedIn/user/SavePOI', data);
    };
    this.removeFromFavor = function (data) {
        return $http.post(serverUrl + 'loggedIn/user/DeleteSavedPOI', data);
    };


}]).controller('searchPOIController', ['searchPoiService', '$location', 'toastr', 'localStorageModel','setTokenService', '$scope',
    function (searchPoiService, $location, toastr, localStorageModel, setTokenService, $scope) {

    let vm = this;
    vm.pois = undefined;
    vm.chosenCategory = undefined;
    vm.poisOfCategory = [];
    vm.categories = [];
    vm.importCategories = false;
    vm.importPOIs = false;
    vm.importAllData = false;
    vm.filteredCategory = false;
    vm.filteredRank = false;
    vm.filteredName = false;
    vm.tempArray = [];
    vm.userId = localStorageModel.get('userId');
    vm.isSaved = isSaved;
    vm.addToFavorites = addToFavorites;
    vm.removeFromFavorites = removeFromFavorites;
    vm.getPOIinformation = getPOIinformation;
    vm.filterByCategory = filterByCategory;
    vm.filterByRank = filterByRank;
    vm.filterByName = filterByName;
    loadPois();
    loadCategories();

    function isSaved(poi){
        return $scope.$parent.vm.existsInFavorites(poi.poiId);
    }

    function addToFavorites(poiId){
        vm.dataToAddPOI =
            {
                'userId' : vm.userId,
                'poiId' : poiId
            };
        searchPoiService.addToFavor(vm.dataToAddPOI).then(function () {
            toastr.success("Added new POI to your favorites!");
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

        searchPoiService.removeFromFavor(vm.dataToRemovePOI).then(function () {
            toastr.success("POI was deleted from your favorites");
            $scope.$parent.vm.removeFromFavorites(poiId);
            isSaved(poi);
        },function () {
            toastr.error("Deleting the POI from favorites failed");
        });
    }

    function loadPois()
    {
        searchPoiService.getPOIs().then( function (response){
            vm.pois = response.data;
            vm.AllPOIs = response.data;
            vm.importPOIs = true;
            vm.importAllData = vm.importPOIs && vm.importCategories;
        }, function (response) {
            toastr.error('Failed to load data from server.');
        });
    }

    function loadCategories() {
        searchPoiService.getCategories().then(function (response) {
            for (let i = 0; i < response.data.length; i++) {
                vm.categories[i] = response.data[i]['categoryName'];
            }
            vm.importCategories = true;
            vm.importAllData = vm.importPOIs && vm.importCategories;
        }, function (response) {
            toastr.error('Failed to load data from server.');
        });
    }

    function getPOIinformation(poi){
        $location.path('/POIinformation/' + poi['poiId']);

    }


    function filterByName(){
        vm.pois = vm.AllPOIs;
        let counter = 0;
        let length = vm.pois.length;
        for(let i = 0; i < length; i++){
            if(vm.pois[i].poiName.includes(vm.text)){
                vm.tempArray[counter] = vm.pois[i];
                counter++;
            }
        }
        vm.pois = [];
        for(let i = 0; i < vm.tempArray.length; i++) {
            vm.pois[i] = vm.tempArray[i];
        }
        vm.tempArray = [];
        vm.filteredName = true;
        vm.filteredRank = false;
        vm.filteredCategory = false;
    }

    function filterByCategory(){
        if(vm.chosenCategory === undefined)
        {
            vm.filteredCategory = false;
            vm.filteredName = false;
            vm.filteredRank = false;
        }
        else
        {
            vm.pois = vm.AllPOIs;
            vm.poisOfCategory = [];
            let counter = 0;
            for(let i = 0; i < vm.pois.length; i++) {
                if(vm.chosenCategory === vm.pois[i].categoryName) {
                    vm.poisOfCategory[counter] = vm.pois[i];
                    counter++;
                }
            }
            vm.filteredCategory = true;
            vm.filteredName = false;
            vm.filteredRank = false;
        }
    }

    function filterByRank(){
        if(vm.rank === undefined || vm.rank === false){
            loadPois();
            vm.filteredName = false;
            vm.filteredCategory = false;
        }
        else{
            vm.pois = vm.AllPOIs;
            for(let i = 0; i < vm.pois.length; i++){
                for(let j = 0; j < vm.pois.length - 1; j++){
                    if(vm.pois[j].rank < vm.pois[j+1].rank){
                        let tmp = vm.pois[j];
                        vm.pois[j] = vm.pois[j + 1];
                        vm.pois[j + 1] = tmp;

                    }
                }
            }
            vm.filteredRank = true;
            vm.filteredName = false;
            vm.filteredCategory = false;
        }

    }

}]);


