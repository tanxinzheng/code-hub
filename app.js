marked.setOptions({
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: true,
  smartLists: true,
  smartypants: false
});

angular.module('app', [
  'ui.router'
]).config(function ($stateProvider) {
  $stateProvider
    .state('home', {
      url: '',
      controller: 'HomeCtrl',
      templateUrl: 'templates/home.html'
    })
    .state('project', {
      url: '/:projectId',
      controller: 'ProjectCtrl',
      templateUrl: 'templates/project.html',
      resolve: {
        dockerfile: function ($http, $state, $stateParams) {
          return $http({
            method: 'GET',
            url: 'https://api.github.com/repos/tanxinzheng/' + $stateParams.projectId + '/contents/Dockerfile',
            headers: {
              Accept: 'application/vnd.github.VERSION.raw'
            }
          }).then(
            function (res) {
              return res.data;
            },
            function (res) {
              alert(res.data.message);
              console.error(res);
              $state.go('home');
            }
          );
        },
        readme: function ($http, $state, $stateParams) {
          return $http({
            method: 'GET',
            url: 'https://api.github.com/repos/tanxinzheng/' + $stateParams.projectId + '/readme',
            headers: {
              Accept: 'application/vnd.github.VERSION.raw'
            }
          }).then(
            function (res) {
              return res.data;
            },
            function (res) {
              alert(res.data.message);
              console.error(res);
              $state.go('home');
            }
          );
        }
      }
    });
}).run(function ($http, $rootScope, $state) {
  $rootScope._ = _;
  $rootScope.projects = [];

  $http.get('https://api.github.com/users/tanxinzheng/repos?per_page=100')
    .success(function (projects) {
      _.sortBy(projects, 'name').forEach(function (project) {
        if (!_.contains(['tanxinzheng.github.io'], project.name)) {
          $rootScope.projects.push({
            id: project.name,
            description: project.description,
            url:project.html_url
          });
        }
      });
    })
    .error(function (err) {
      alert(err.message);
      $state.go('home');
    });
}).controller('HomeCtrl', function ($scope) {
  // ...
}).controller('ProjectCtrl', function ($sce, $scope, $stateParams, dockerfile, readme) {
  $scope.projectId = $stateParams.projectId;
  $scope.dockerfile = $sce.trustAsHtml(dockerfile);
  $scope.readme = $sce.trustAsHtml(marked(readme));
});
