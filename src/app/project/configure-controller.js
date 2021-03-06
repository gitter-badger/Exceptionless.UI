(function () {
  'use strict';

  angular.module('app.project')
    .controller('project.Configure', ['$state', '$stateParams', 'notificationService', 'projectService', 'tokenService', function ($state, $stateParams, notificationService, projectService, tokenService) {
      var projectId = $stateParams.id;

      function copied() {
        notificationService.success('Copied!');
      }

      function getDefaultApiKey() {
        function onSuccess(response) {
          vm.apiKey = response.data.id;
          return vm.apiKey;
        }

        function onFailure() {
          notificationService.error('An error occurred while getting the API key for your project.');
        }

        return tokenService.getProjectDefault(projectId).then(onSuccess, onFailure);
      }

      function getProject() {
        function onSuccess(response) {
          vm.project = response.plain();
          return vm.project;
        }

        function onFailure() {
          $state.go('app.dashboard');
          notificationService.error('The project "' + projectId + '" could not be found.');
        }

        return projectService.getById(projectId).then(onSuccess, onFailure);
      }

      function getProjectTypes() {
        return [
          { key: 'Exceptionless.Mvc', name: 'ASP.NET MVC', config: 'web.config' },
          { key: 'Exceptionless.WebApi', name: 'ASP.NET Web API', config: 'web.config' },
          { key: 'Exceptionless.Web', name: 'ASP.NET Web Forms', config: 'web.config' },
          { key: 'Exceptionless.Windows', name: 'Windows Forms', config: 'app.config' },
          { key: 'Exceptionless.Wpf', name: 'Windows Presentation Foundation (WPF)', config: 'app.config' },
          { key: 'Exceptionless.Nancy', name: 'Nancy', config: 'app.config' },
          { key: 'Exceptionless', name: 'Console', config: 'app.config' }
        ];
      }

      function hasProjectData() {
        return vm.project.total_event_count > 0;
      }

      function navigateToDashboard() {
        $state.go('app.project-dashboard', {projectId: vm.projectId});
      }

      var vm = this;
      vm.copied = copied;
      vm.apiKey = null;
      vm.currentProjectType = {};
      vm.hasProjectData = hasProjectData;
      vm.navigateToDashboard = navigateToDashboard;
      vm.project = {};
      vm.projectTypes = getProjectTypes();

      getDefaultApiKey().then(getProject);
    }]);
}());
