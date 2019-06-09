angular.module('appModule').service('searchPoiService', ['$http', function ($http) {
    let serverUrl = 'http://localhost:4000/';

    this.getPOIs = function () {
        return $http.get(serverUrl + 'getPOIs');
    };
    this.getCategories = function () {
        return $http.get(serverUrl + 'getCategories')
    };


}]).controller('searchPOIController', ['searchPoiService', '$location', 'toastr',
    function (searchPoiService, $location, toastr) {

    let vm = this;
    vm.pois = undefined;
    vm.search = undefined;
    vm.categories = [];
    vm.importCategories = false;
    vm.importPOIs = false;
    vm.importAllData = false;
    vm.getPOIinformation = getPOIinformation;
    loadPois();
    loadCategories();

    function loadPois()
    {
        searchPoiService.getPOIs().then( function (response){
            vm.pois = response.data;
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


}]);


