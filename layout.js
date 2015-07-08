'use strict';

angular.module('algorea')
  .directive('viewButton', function () {
    return {
      restrict: 'A',
      template: '<button type="button" class="btn btn-default btn-xs view-button" ng-click="toggleFullscreen();">'+
                  '<span class="glyphicon glyphicon-{{layout.buttonClass}}"></span>'+
                '</button>',
  };
});

angular.module('algorea')
  .controller('layoutController', ['$scope', '$window', '$timeout', '$rootScope', '$interval', function ($scope, $window, $timeout, $rootScope, $interval) {
    var pane_west = $('.ui-layout-west');
    var pane_center = $('.ui-layout-center');
    var container = $('#layoutContainer');
    var taskMinWidth = 820;
    var nonTaskMinWidth = 400;
    // $scope.layout will be accesset and set by viewButton directive in a subscope, so
    // it must be an object, or prototypal inheritance will mess everything
    $scope.layout = {
      west_is_open : true,
      tablesResized: function() {
      },
      refreshSizes : function() {

      },
      buttonClass: "fullscreen",
      state: "normal",
      goFullscreen: function() {

      },
      goNormal: function() {

      },
      toggleLeft: function() {
         $('#sidebar-left').toggleClass('sidebar-left-toggled');
         $('.main-left-arrow').toggleClass('main-left-arrow-toggled');
         $scope.layout.refreshSizes();
      },
      toggleRight: function() {
         $('#sidebar-right').toggleClass('sidebar-right-toggled');
         $('#main-titlebar-community').toggleClass('main-titlebar-community-toggled');
         $('.main-right-arrow').toggleClass('main-right-arrow-toggled');
         $scope.layout.refreshSizes();
      },
      setRightIcon: function() {
         if ($('#sidebar-right').hasClass('sidebar-right-toggled')) {
            $('#main-titlebar-community').addClass('main-titlebar-community-toggled');
         }
      },
      toggleMenu: function() {
         $('#menu').toggleClass('menu-toggled');
         $('#fixed-header-room').toggleClass('fixed-header-room-toggled');
      },
      closeMenu: function() {
         $scope.layout.menuOpen = false;
         if ($(window).width() < 1100) {
            if ($('#menu').hasClass('menu-toggled')) {
               $scope.layout.toggleMenu();
            }
         } else {
            if (!$('#menu').hasClass('menu-toggled')) {
               $scope.layout.toggleMenu();
            }
         }
      },
      closeRight: function() {
         $scope.layout.rightOpen = false;
         if ($(window).width() < 1100) {
            if ($('#sidebar-right').hasClass('sidebar-right-toggled')) {
               console.error('toggle right in closeRight');
               $scope.layout.toggleRight();
            }
         } else {
            if (!$('#sidebar-right').hasClass('sidebar-right-toggled')) {
               $scope.layout.toggleRight();
            }
         }
      },
      closeLeft: function() {
         $scope.layout.leftOpen = false;
         if ($(window).width() < 1100) {
            if ($('#sidebar-left').hasClass('sidebar-left-toggled')) {
               $scope.layout.toggleLeft();
            }
         } else {
            if (!$('#sidebar-left').hasClass('sidebar-left-toggled')) {
               $scope.layout.toggleLeft();
            }
         }
      },
      openMenu: function() {
         $scope.layout.menuOpen = true;
         if ($(window).width() < 1100) {
            if (!$('#menu').hasClass('menu-toggled')) {
               $scope.layout.toggleMenu();
            }
         } else {
            if ($('#menu').hasClass('menu-toggled')) {
               $scope.layout.toggleMenu();
            }
         }
      },
      openRight: function() {
         $scope.layout.rightOpen = true;
         if ($(window).width() < 1100) {
            if (!$('#sidebar-right').hasClass('sidebar-right-toggled')) {
               $scope.layout.toggleRight();
            }
         } else {
            if ($('#sidebar-right').hasClass('sidebar-right-toggled')) {
               $scope.layout.toggleRight();
            }
         }
      },
      openLeft: function() {
         $scope.layout.leftOpen = true;
         if ($(window).width() < 1100) {
            if (!$('#sidebar-left').hasClass('sidebar-left-toggled')) {
               $scope.layout.toggleLeft();
            }
         } else {
            console.error('pouet');
            if ($('#sidebar-left').hasClass('sidebar-left-toggled')) {
               console.error('je trouve la classe toggled');
               $scope.layout.toggleLeft();
            }
         }
      },
      closeIfOpen: function() {
         if ($scope.layout.leftOpen) {
            $scope.layout.closeLeft();
         }
         if ($scope.layout.menuOpen) {
            $scope.layout.closeMenu();
         }
      }
    };
    $scope.toggleFullscreen = function() {
      if ($scope.layout.state == "normal") {

      } else {

      }
    };
   var lastRightIsTask;
   $scope.layout.rightIsTask = function(rightIsTask) {
      if (rightIsTask == lastRightIsTask) {
         return;
      }
      lastRightIsTask = rightIsTask;
       if (rightIsTask) {
         $scope.layout.closeMenu();
         $scope.layout.closeLeft();
         $scope.layout.closeRight();
       } else if ($(window).width() > 1100) {
         $scope.layout.leftOpen = false;
         $scope.layout.rightOpen = false;
         $scope.layout.menuOpen = false;
         if ($('#sidebar-left').hasClass('sidebar-left-toggled')) {
            $scope.layout.toggleLeft();
         }
         if ($('#sidebar-right').hasClass('sidebar-right-toggled')) {
            $scope.layout.toggleRight();
         }
         if ($('#menu').hasClass('menu-toggled')) {
            $scope.layout.toggleMenu();
         }
       }
       $scope.layout.refreshSizes();
    };
    var isCurrentlyOnePage;
    $scope.layout.isOnePage = function(isOnePage) {
       if (typeof isCurrentlyOnePage !== 'undefined' && isOnePage == isCurrentlyOnePage) {
          return;
       }
       if (isOnePage) {
//          $scope.layout.global.options.west.spacing_closed = 0;
//          $scope.layout.global.close('west');
          $('#sidebar-left').css('display', 'none');
          isCurrentlyOnePage = isOnePage;
       } else {
//          $scope.layout.global.options.west.spacing_closed = 6;
//          $scope.layout.global.open('west');
          $('#sidebar-left').css('display', 'flex');
          isCurrentlyOnePage = isOnePage;
       }
    };
    // inspired from https://github.com/capaj/ng-tools/blob/master/src/debounce.js
    // used on onresize for obvious performance reasons
    function debounce(fn, timeout, apply){
       apply = angular.isUndefined(apply) ? true : apply;
       var nthCall = 0;
       return function(){ // intercepting fn
          var that = this;
          var argz = arguments;
          nthCall++;
          var later = (function(version){
             return function(){
                if (version === nthCall){
                   return fn.apply(that, argz);
                }
             };
          })(nthCall);
          return $timeout(later, timeout, apply);
       };
    }
    $scope.layout.separateEditorOK = false;
    var lastSeparateEditorOK = false;
    $scope.layout.refreshSizes = function() {
       if (lastRightIsTask) { // things are handled automatically for everything but the task layout
          console.error('refreshSizes');
          var availableMainWidth = $('#main-area').width();
          console.error(availableMainWidth);
          var minWidth = $('#task-right').css('min-width');
          if (!minWidth) {minWidth = '0px';}
          minWidth = parseInt(minWidth.slice(0,-2));
          if (!minWidth) {minWidth = 800;}
          console.error(minWidth);
          console.error(availableMainWidth - 2*minWidth);
          if (availableMainWidth - 2*minWidth > 40) {
            $scope.layout.separateEditorOK = true;
          } else {
            $scope.layout.separateEditorOK = false;
          }
         if (lastSeparateEditorOK != $scope.layout.separateEditorOK) {
            $timeout($rootScope.apply);
         }
         lastSeparateEditorOK = $scope.layout.separateEditorOK;
       } else {
         $scope.layout.separateEditorOK = false;
       }
    };
    // resizing on window resizing (tamed)
    $window.onresize = debounce($scope.layout.refreshSizes, 200, false);
    // function to be called at sync end by the service (it's alive. It's alive...)
    $rootScope.refreshSizes = $scope.layout.refreshSizes;
    // resizing on state change
    $rootScope.$on('$viewContentLoaded', function() {
       $timeout($scope.layout.refreshSizes, 0); // 100 works here, might have to be changed for slow computers
    });
    $interval($scope.layout.refreshSizes, 1000);
    $scope.$on('layout.taskLayoutChange', $scope.layout.refreshSizes);
}]);