(function () {
  'use strict';

  angular.module('exceptionless.stacks')
    .directive('stacks', function () {
      return {
        bindToController: true,
        restrict: 'E',
        replace: true,
        scope: {
          settings: '='
        },
        templateUrl: 'components/stacks/stacks-directive.tpl.html',
        controller: ['$window', '$state', '$stateParams', 'linkService', 'filterService', 'notificationService', 'paginationService', 'stacksActionsService', function ($window, $state, $stateParams, linkService, filterService, notificationService, paginationService, stacksActionsService) {
          var vm = this;

          function get(options) {
            function onSuccess(response) {
              vm.selectedIds = [];
              vm.stacks = response.data.plain();

              var links = linkService.getLinksQueryParameters(response.headers('link'));
              vm.previous = links['previous'];
              vm.next = links['next'];

              vm.pageSummary = paginationService.getCurrentPageSummary(response.data, vm.currentOptions.page, vm.currentOptions.limit);

              if (vm.stacks.length === 0 && vm.currentOptions.page && vm.currentOptions.page > 1) {
                return get();
              }

              return vm.stacks;
            }

            vm.currentOptions = options || vm.settings.options;
            return vm.settings.get(vm.currentOptions).then(onSuccess);
          }

          function hasStacks() {
            return vm.stacks && vm.stacks.length > 0;
          }

          function hasSelection() {
            return vm.selectedIds.length > 0;
          }

          function open(id, event) {
            if (event.ctrlKey || event.which === 2) {
              $window.open('/#/app/stack/' + id, '_blank');
            } else {
              $state.go('app.stack', { id: id });
            }
          }

          function nextPage() {
            return get(vm.next);
          }

          function previousPage() {
            return get(vm.previous);
          }

          function save(action) {
            if (!hasSelection()) {
              notificationService.info(null, 'Please select one or more stacks');
            } else {
              action.run(vm.selectedIds);
            }
          }

          function updateSelection() {
            if (!hasStacks())
              return;

            if (hasSelection())
              vm.selectedIds = [];
            else
              vm.selectedIds = vm.stacks.map(function (stack) {
                return stack.id;
              });
          }

          vm.actions = stacksActionsService.getActions();
          vm.get = get;
          vm.hasStacks = hasStacks;
          vm.hasSelection = hasSelection;
          vm.nextPage = nextPage;
          vm.open = open;
          vm.previousPage = previousPage;
          vm.save = save;
          vm.selectedIds = [];
          vm.showType = vm.settings.summary ? vm.settings.showType : !filterService.getEventType();
          vm.updateSelection = updateSelection;

          get();
        }],
        controllerAs: 'vm'
      };
    });
}());
