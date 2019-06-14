angular.module('appModule').controller('IndexController', ['localStorageModel', '$location',
    function(localStorageModel, $location)
{
    let vm = this;
    vm.username = undefined;
    vm.userConnected = false;
    vm.savedPOIs = [];

    vm.parentAddToFavorites = parentAddToFavorites;
    vm.parentRemoveFromFavorites = parentRemoveFromFavorites;
    vm.existsInFavorites = existsInFavorites;
    vm.logout = logout;

    function logout()
    {
        localStorageModel.deleteValue('token');
        localStorageModel.deleteValue('username');
        localStorageModel.deleteValue('userId');
        localStorageModel.deleteValue('favoritePOIs');
        vm.savedPOIs = [];
        vm.username = undefined;
        vm.userConnected = false;

        $location.path('/');

    }

    function parentAddToFavorites(poiID){
        if(!existsInFavorites(poiID))
            vm.savedPOIs.push(poiID);
        if(!localStorageModel.get('favoritePOIs'))
        {
            localStorageModel.add('favoritePOIs', vm.savedPOIs);
        }
        else
            localStorageModel.update('favoritePOIs',vm.savedPOIs);
    }

    function parentRemoveFromFavorites(poiID){
        if(existsInFavorites(poiID))
        {
            let index = vm.savedPOIs.indexOf(poiID);
            vm.savedPOIs.splice(index,1);
        }
        localStorageModel.update('favoritePOIs',vm.savedPOIs);
    }

    function existsInFavorites(poiID){
        return vm.savedPOIs.includes(poiID);
    }


}]);