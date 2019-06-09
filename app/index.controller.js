angular.module('appModule').controller('IndexController', ['localStorageModel', '$location',
    function(localStorageModel, $location)
{
    let vm = this;
    vm.username = undefined;
    vm.userConnected = false;

    vm.logout = logout;

    function logout()
    {
        localStorageModel.deleteValue('token');
        localStorageModel.deleteValue('username');
        localStorageModel.deleteValue('userId');
        vm.username = undefined;
        vm.userConnected = false;

        $location.path('/');

    }


}]);