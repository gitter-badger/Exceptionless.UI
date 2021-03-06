﻿(function () {
  'use strict';

  angular.module('exceptionless.signalr', [
    'SignalR',

    'exceptionless.auth',
    'app.config'
  ])
  .factory('signalRService', ['$rootScope', '$timeout', '$log', 'authService', 'BASE_URL', 'Hub', function ($rootScope, $timeout, $log, authService, BASE_URL, Hub) {
    var signalR;

    function start() {
      startDelayed(0);
    }

    function startDelayed(delay) {
      if (signalR)
        stop();

      signalR = $timeout(function (){
        var hub = new Hub('messages', {
          rootPath: BASE_URL + '/push',

          // client side methods
          listeners: {
            'entityChanged': function (entityChanged) {
              $rootScope.$emit(entityChanged.type + 'Changed', entityChanged);
            },
            'eventOccurrence': function (eventOccurrence) {
              $rootScope.$emit('eventOccurrence', eventOccurrence);
            },
            'stackUpdated': function (stackUpdated) {
              $rootScope.$emit('stackUpdated', stackUpdated);
            },
            'planOverage': function (planOverage) {
              $rootScope.$emit('planOverage', planOverage);
            },
            'planChanged': function (planChanged) {
              $rootScope.$emit('planChanged', planChanged);
            }
          },

          queryParams: {
            'access_token': authService.getToken()
          },

          // handle connection error
          errorHandler: function (error) {
            $log.error(error);
          }
        });
      }, delay || 1000);
    }

    function stop() {
      if (!signalR)
        return;

      $timeout.cancel(signalR);
      signalR = null;
    }

    var service = {
      start: start,
      startDelayed: startDelayed,
      stop: stop
    };

    return service;
  }]);
}());
