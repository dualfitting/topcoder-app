(function () {

  angular
    .module('tc.profile')
    .controller('ProfileCtrl', ProfileCtrl);

  ProfileCtrl.$inject = ['$scope', 'ProfileService', '$q'];

  function ProfileCtrl($scope, ProfileService, $q) {
    var vm = this;
    var vms = [vm];
    vm.title = "Profile";
    vm.message = "Message"
    vm.profile = {};
    vm.tracks = [];
    $scope.initProfile = initProfile;

    activate();

    function activate() {
      vm.mockProfile = ProfileService.getMockMemberProfile();
      vm.memberFor = moment().year() - moment(vm.profile.createdAt).year() + '';
      var profile = ProfileService.getUserProfile();
      var stats = ProfileService.getUserStats();
      var skills = ProfileService.getUserSkills();
      $q.all([profile, stats, skills]).then(function(data) {
        profile = data[0];
        stats = data[1];
        skills = data[2];
        vms = vms.forEach(function(vm) {
          vm.profile = profile;
          vm.tenure = moment().isoWeekYear() - moment(profile.createdAt).isoWeekYear();
          vm.stats = stats;
          vm.tracks = ProfileService.getTracks(vm.stats);
          vm.numProjects = ProfileService.getNumProjects(vm.stats);
          vm.numWins = ProfileService.getNumWins(vm.stats);
          // slicing is temporary,
          // until horizontal scroll is implemented
          vm.skills = skills.skills.slice(0,6);
          vm.categories = ProfileService.getRanks(vm.stats).slice(0,4);
        });
      });
    }

    function initProfile(vm) {
      vms.push(vm);
    }

  }


})();