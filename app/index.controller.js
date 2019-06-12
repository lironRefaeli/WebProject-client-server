angular.module('appModule').controller('IndexController', ['localStorageModel', '$location',
    function(localStorageModel, $location)
{
    let vm = this;
    vm.username = undefined;
    vm.userConnected = false;
    vm.savedPOIs = [];

    vm.addToFavorites = addToFavorites;
    vm.removeFromFavorites = removeFromFavorites;
    vm.existsInFavorites = existsInFavorites;
    vm.logout = logout;

    function logout()
    {
        localStorageModel.deleteValue('token');
        localStorageModel.deleteValue('username');
        localStorageModel.deleteValue('userId');
        vm.savedPOIs = [];
        vm.username = undefined;
        vm.userConnected = false;

        $location.path('/');

    }

    function addToFavorites(poiID){
        vm.savedPOIs.push(poiID);
    }

    function removeFromFavorites(poiID){
        let index = vm.savedPOIs.indexOf(poiID);
        vm.savedPOIs.splice(index,1);
    }

    function existsInFavorites(poiID){
        return vm.savedPOIs.includes(poiID);
    }


}]);