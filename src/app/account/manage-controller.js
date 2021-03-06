(function () {
  'use strict';

  angular.module('app.account')
    .controller('account.Manage', ['authService', 'featureService', 'notificationService', 'projectService', 'userService', function (authService, featureService, notificationService, projectService, userService) {
      var vm = this;

      function authenticate(provider) {
        function onFailure(response) {
          var message = 'An error occurred while adding external login.';
          if (response.data && response.data.message)
            message += ' Message: ' + response.data.message;

          notificationService.error(message);
        }

        return authService.authenticate(provider).catch(onFailure);
      }

      function canRemoveOAuthAccount() {
        return hasLocalAccount() || (vm.user.o_auth_accounts && vm.user.o_auth_accounts.length > 1);
      }

      function changePassword(isValid) {
        if (!isValid) {
          return;
        }

        function onSuccess() {
          notificationService.info('You have successfully changed your password.');
          vm.password = {};
          vm.passwordForm.$setUntouched(true);
          vm.passwordForm.$setPristine(true);
        }

        function onFailure(response) {
          var message = 'An error occurred while trying to change your password.';
          if (response.data && response.data.message) {
            message += ' Message: ' + response.data.message;
          }

          notificationService.error(message);
        }

        return authService.changePassword(vm.password).then(onSuccess, onFailure);
      }

      function get() {
        return getUser().then(getProjects).then(getEmailNotificationSettings);
      }

      function getEmailNotificationSettings() {
        function onSuccess(response) {
          vm.emailNotificationSettings = response.data.plain();
          return vm.emailNotificationSettings;
        }

        function onFailure() {
          notificationService.error('An error occurred while loading the notification settings.');
        }

        vm.emailNotificationSettings = null;
        if (!vm.currentProject.id) {
          return;
        }

        return projectService.getNotificationSettings(vm.currentProject.id, vm.user.id).then(onSuccess, onFailure);
      }

      function getProjects() {
        function onSuccess(response) {
          vm.projects = response.data.plain();

          vm.currentProject = vm.projects.filter(function(p) { return p.id === vm.currentProject.id; })[0];
          if (!vm.currentProject) {
            vm.currentProject = vm.projects.length > 0 ? vm.projects[0] : {};
          }

          return vm.projects;
        }

        function onFailure() {
          notificationService.error('An error occurred while loading the projects.');
        }

        return projectService.getAll().then(onSuccess, onFailure);
      }

      function getUser() {
        function onSuccess(response) {
          vm.user = response.data.plain();
          return vm.user;
        }

        function onFailure(response) {
          var message = 'An error occurred while loading your user profile.';
          if (response.data && response.data.message) {
            message += ' Message: ' + response.data.message;
          }

          notificationService.error(message);
        }

        return userService.getCurrentUser().then(onSuccess, onFailure);
      }

      function hasEmailNotifications() {
        return vm.user.email_notifications_enabled && vm.emailNotificationSettings;
      }

      function hasLocalAccount() {
        return vm.user.has_local_account === true;
      }

      function hasOAuthAccounts() {
        return vm.user && vm.user.o_auth_accounts && vm.user.o_auth_accounts.length > 0;
      }

      function hasPremiumFeatures() {
        return featureService.hasPremium();
      }

      function hasProjects() {
        return vm.projects.length > 0;
      }

      function hasPremiumEmailNotifications() {
        return hasEmailNotifications() && hasPremiumFeatures();
      }

      function resendVerificationEmail() {
        function onFailure(response) {
          var message = 'An error occurred while sending your verification email.';
          if (response.data && response.data.message) {
            message += ' Message: ' + response.data.message;
          }

          notificationService.error(message);
        }

        return userService.resendVerificationEmail(vm.user.id).catch(onFailure);
      }

      function saveEmailAddress(isValid) {
        if (!isValid) {
          return;
        }

        function onSuccess(response) {
          vm.user.is_email_address_verified = response.data.is_verified;
        }

        function onFailure(response) {
          var message = 'An error occurred while saving your email address.';
          if (response.data && response.data.message) {
            message += ' Message: ' + response.data.message;
          }

          notificationService.error(message);
        }

        return userService.updateEmailAddress(vm.user.id, vm.user.email_address).then(onSuccess, onFailure);
      }

      function saveEmailNotificationSettings() {
        function onFailure(response) {
          var message = 'An error occurred while saving your notification settings.';
          if (response.data && response.data.message) {
            message += ' Message: ' + response.data.message;
          }

          notificationService.error(message);
        }

        return projectService.setNotificationSettings(vm.currentProject.id, vm.user.id, vm.emailNotificationSettings).catch(onFailure);
      }

      function saveEnableEmailNotification() {
        function onFailure(response) {
          var message = 'An error occurred while saving your email notification preferences.';
          if (response.data && response.data.message) {
            message += ' Message: ' + response.data.message;
          }

          notificationService.error(message);
        }

        return userService.update(vm.user.id, { email_notifications_enabled: vm.user.email_notifications_enabled }).catch(onFailure);
      }

      function saveUser(isValid) {
        if (!isValid) {
          return;
        }

        function onFailure(response) {
          var message = 'An error occurred while saving your full name.';
          if (response.data && response.data.message) {
            message += ' Message: ' + response.data.message;
          }

          notificationService.error(message);
        }

        return userService.update(vm.user.id, vm.user).catch(onFailure);
      }

      function unlink(account) {
        function onSuccess() {
          vm.user.o_auth_accounts.splice(vm.user.o_auth_accounts.indexOf(account), 1);
        }

        function onFailure(response) {
          var message = 'An error occurred while removing the external login.';
          if (response.data && response.data.message) {
            message += ' Message: ' + response.data.message;
          }

          notificationService.error(message);
        }

        return authService.unlink(account.provider, account.provider_user_id).then(onSuccess, onFailure);
      }

      vm.authenticate = authenticate;
      vm.canRemoveOAuthAccount = canRemoveOAuthAccount;
      vm.changePassword = changePassword;
      vm.currentProject = {};
      vm.emailNotificationSettings = null;
      vm.getEmailNotificationSettings = getEmailNotificationSettings;
      vm.hasEmailNotifications = hasEmailNotifications;
      vm.hasLocalAccount = hasLocalAccount;
      vm.get = get;
      vm.hasOAuthAccounts = hasOAuthAccounts;
      vm.hasPremiumEmailNotifications = hasPremiumEmailNotifications;
      vm.hasPremiumFeatures = hasPremiumFeatures;
      vm.hasProjects = hasProjects;
      vm.password = {};
      vm.passwordForm = {};
      vm.projects = [];
      vm.resendVerificationEmail = resendVerificationEmail;
      vm.saveEmailAddress = saveEmailAddress;
      vm.saveEmailNotificationSettings = saveEmailNotificationSettings;
      vm.saveEnableEmailNotification = saveEnableEmailNotification;
      vm.saveUser = saveUser;
      vm.unlink = unlink;
      vm.user = {};

      get();
    }]);
}());
