angular.module('appModule').service('homeService', ['$http', function($http){
    let serverUrl = 'http://localhost:4000/';
    this.threeRandomPOI = function () {
        return $http.get(serverUrl + 'threeRandomPOI');
    };

}]).controller('homePageController', ['$scope', 'homeService', function ($scope, homeService) {

    let vm = this;
    vm.threePOIs = undefined;
    loadThreePOIs();


    function loadThreePOIs(){
        homeService.threeRandomPOI().then(function (response){
            vm.threePOIs = response.data;
        })
    }

}]);

