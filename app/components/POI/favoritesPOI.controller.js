angular.module('appModule').service('favoritesPOIService', ['$http', function ($http) {
    let serverUrl = 'http://localhost:4000/';

    this.getCategories = function () {
        return $http.get(serverUrl + 'getCategories')
    };
    this.getSavedPOI = function (data) {
        return $http.get(serverUrl + 'loggedIn/user/getUserSavedPOIs/' + data)
    };
    this.saveNewOrder = function (data) {
        return $http.put(serverUrl + 'loggedIn/user/changeOrderOfSavedPOIs', data)
    };
    this.addToFavor = function (data) {
        return $http.post(serverUrl + 'loggedIn/user/SavePOI', data);
    };
    this.removeFromFavor = function (data) {
        return $http.post(serverUrl + 'loggedIn/user/DeleteSavedPOI', data);
    };
    this.getSavedPOI = function (data) {
        return $http.get(serverUrl + 'loggedIn/user/getUserSavedPOIs/' + data)
    };


}]).controller('favoritesPOIController', ['$scope','favoritesPOIService', '$location', 'toastr', 'localStorageModel','setTokenService',
    function ($scope, favoritesPOIService, $location, toastr, localStorageModel, setTokenService) {

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
        vm.cnageOrder = false;
        vm.saveOrder = false;
        vm.disableSaveButton = true;
        vm.tempArray = [];
        vm.userId = localStorageModel.get('userId');
        vm.getPOIinformation = getPOIinformation;
        vm.filterByCategory = filterByCategory;
        vm.filterByRank = filterByRank;
        vm.filterByName = filterByName;
        vm.SaveUserOrder = SaveUserOrder;
        vm.ChangeUserOrder = ChangeUserOrder;
        vm.isSaved = isSaved;
        vm.addToFavorites = addToFavorites;
        vm.removeFromFavorites = removeFromFavorites;
        checkLocalStorage();
        loadUserPois();
        loadCategories();


        function checkLocalStorage(){
            vm.token = localStorageModel.get('token');
            if (vm.token){
                setTokenService.set(vm.token);
                importSavedPOIs();
                $scope.$parent.vm.username = localStorageModel.get('username');
                $scope.$parent.vm.userConnected = true;
            }
        }

        function importSavedPOIs(){
            favoritesPOIService.getSavedPOI(localStorageModel.get('userId')).then(function (response) {
                vm.userFavoritePOIs = response.data;
                for(let i = 0; i < vm.userFavoritePOIs.length; i++){
                    $scope.$parent.vm.parentAddToFavorites(vm.userFavoritePOIs[i].poiId);
                }
            });
        }


        function isSaved(poi){
            return $scope.$parent.vm.existsInFavorites(poi.poiId);
        }

        function addToFavorites(poiId){
            vm.dataToAddPOI =
                {
                    'userId' : vm.userId,
                    'poiId' : poiId
                };
            favoritesPOIService.addToFavor(vm.dataToAddPOI).then(function () {
                toastr.success("Added new POI to your favorites!");
                loadUserPois();
                $scope.$parent.vm.parentAddToFavorites(poiId);
                //(poi);
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

            favoritesPOIService.removeFromFavor(vm.dataToRemovePOI).then(function () {
                loadUserPois();
                $scope.$parent.vm.parentRemoveFromFavorites(poiId);
                //isSaved(poi);
            });
        }


        function SaveUserOrder()
        {
            vm.saveOrder = true;
            vm.disableSaveButton = true;
            vm.order = [];
            vm.order = vm.orderInput.split(',');
            vm.validation = [];
            vm.isValid = true;
            if(vm.order.length !== $scope.$parent.vm.savedPOIs.length)
                vm.isValid = false;
            for(let i = 0; i < $scope.$parent.vm.savedPOIs.length; i++)
            {
                if(vm.validation.includes(vm.order[i]) || vm.order[i] > $scope.$parent.vm.savedPOIs.length)
                {
                    vm.isValid = false;
                    break;
                }
                vm.validation.push(vm.order[i]);

            }
            vm.validation = [];
            if(!vm.isValid)
            {
                toastr.error('The format was written wrong, please try again');
            }
            else
            {
                vm.orderObject = [];
                vm.newOrderData =
                    {
                        'userID' : vm.userId,
                        'order' : vm.orderObject
                    };
                for(let i = 0; i < vm.pois.length; i++){
                    vm.orderObject[i] =
                        {
                            'poiID' : vm.pois[i].poiId,
                            'order' : parseInt(vm.order[i])
                        }
                }

                favoritesPOIService.saveNewOrder(vm.newOrderData).then(function (response)
                {
                    toastr.success('New Order is Saved');
                    loadUserPois();
                });
            }

        }

        function ChangeUserOrder()
        {
            vm.disableSaveButton = false;
            vm.changeOrder = true;
            vm.saveOrder = false;
            vm.filteredCategory = false;
            vm.filteredName = false;
            vm.filteredRank = false;
        }

        function loadUserPois()
        {
            favoritesPOIService.getSavedPOI(vm.userId).then( function (response){
                vm.pois = response.data;
                vm.AllPOIs = response.data;
                vm.importPOIs = true;
                vm.importAllData = vm.importPOIs && vm.importCategories;
            }, function () {
                toastr.error('Loading user saved POIs failed');
            });
        }

        function loadCategories() {
            favoritesPOIService.getCategories().then(function (response) {
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
                loadUserPois();
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


