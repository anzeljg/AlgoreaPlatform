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
  .controller('layoutController', ['$scope', '$window', '$timeout', '$rootScope', '$interval', 'mapService', 'itemService', 'pathService', '$state', function ($scope, $window, $timeout, $rootScope, $interval, mapService, itemService, pathService, $state) {
    var pane_west = $('.ui-layout-west');
    var pane_center = $('.ui-layout-center');
    var container = $('#layoutContainer');
    var taskMinWidth = 820;
    var nonTaskMinWidth = 400;
    itemService.getAsyncRecord('items', '1384877030317901919', function() {
       mapService.setRoot('1384877030317901919');
       mapService.setBasePath('4029/4026/4021');
       mapService.prepareMap();
    });
    mapService.setClickedCallback(function(path, lastItem) {
      if (lastItem.sType == 'Task' || lastItem.sType == 'Course' || lastItem.sType == 'Presentation') {
         var pathArray = path.split('/');
         var selr = pathArray.length;
         var sell = selr -1;
         var pathParams = pathService.getPathParams();
         console.error(pathParams);
         console.error(path);
         if (pathParams.basePathStr == path) {
            $scope.layout.closeMap();
         } else {
            $state.go('contents', {path: path,sell:sell,selr:selr});
         }
      }
    });
    $scope.mapInfos = {
       'mapPossible' : true,
       'hasMap':false,
       'mapOpened' : false
    };
   $scope.gotoIndex = function() {
      var defaultPathStr = config.domains.current.defaultPath;
      if (defaultPathStr.substr(0, 10) == '/contents/') {
         defaultPathStr = defaultPathStr.substr(10, defaultPathStr.length);
         var pathArray = defaultPathStr.split('/');
         var selr = pathArray.length;
         var sell = selr -1;
      }
      $state.go('contents', {path: defaultPathStr,sell:0,selr:1});
   }
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
      hasMap: function(hasMap, firstOpening) {
         $scope.mapInfos.hasMap = hasMap;
         if (hasMap == 'always') {
            $scope.layout.openMap();
         } else if (hasMap == 'never') {
            $scope.layout.closeMap();
         } else if (hasMap == 'button' && firstOpening) {
            $scope.layout.closeMap();
         }
      },
      openMap: function() {
         if (!$scope.mapInfos.mapMode) {
            if ($scope.mapInfos.hasMap == 'button') {
               $scope.layout.openMenu();
            }
            $scope.mapInfos.mapMode = true;
            $('#footer').hide();
            $('#view-right').hide();
            $('#map').show();
            mapService.show();
         }
      },
      closeMap: function() {
         if ($scope.mapInfos.mapMode) {
            if ($scope.mapInfos.hasMap == 'button') {
               $scope.layout.closeMenu();
            }
            $('#footer').show();
            $('#view-right').show();
            $('#map').hide();
            $scope.mapInfos.mapMode = false;
         }
      },
      hasLeftMenu: function(hasLeftMenu) {
        if ($('#sidebar-left').hasClass('sidebar-left-hidden') == hasLeftMenu) {
          $('#sidebar-left').toggleClass('sidebar-left-hidden')
        }
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
         console.error('toggleMenu');
         $('#headerContainer').toggleClass('menu-toggled');
         $('#fixed-header-room').toggleClass('fixed-header-room-toggled');
         $('#footer').toggleClass('footer-toggled');
         $scope.layout.syncBreadcrumbs();
      },
      syncBreadcrumbs: function() {
         $('#breadcrumbs').each(function(item) {console.error('debug12');});
         // here we cheat a little: #userinfocontainer-breadcrumbs is recreated from times to times so
         // the class is not always in sync with the menu. A true fix would be to rewrite the layout
         // algorithm entirely
         if ($('#breadcrumbs').hasClass('breadcrumbs-toggled') != $('#menu').hasClass('menu-toggled')) {
            $('#breadcrumbs').toggleClass('breadcrumbs-toggled');
            console.error('hasclass = '+$('#breadcrumbs').hasClass('breadcrumbs-toggled'));
         }
         if ($('#userinfocontainer-breadcrumbs').hasClass('userinfocontainer-breadcrumbs-toggled') != $('#menu').hasClass('menu-toggled')) {
            $('#userinfocontainer-breadcrumbs').toggleClass('userinfocontainer-breadcrumbs-toggled');
         }
      },
      closeMenu: function() {
         console.error('closeMenu');
         $scope.layout.menuOpen = false;
         if ($(window).width() < 1100) {
            if ($('#headerContainer').hasClass('menu-toggled')) {
               $scope.layout.toggleMenu();
            }
         } else {
            if (!$('#headerContainer').hasClass('menu-toggled')) {
               $scope.layout.toggleMenu();
            }
         }
         $scope.layout.syncBreadcrumbs();
      },
      openMenu: function() {
         console.error('openMenu');
         $scope.layout.menuOpen = true;
         if ($(window).width() < 1100) {
            if (!$('#headerContainer').hasClass('menu-toggled')) {
               $scope.layout.toggleMenu();
            }
         } else {
            if ($('#headerContainer').hasClass('menu-toggled')) {
               $scope.layout.toggleMenu();
            }
         }
         $scope.layout.syncBreadcrumbs();
      },
      closeRight: function() {
         $scope.layout.rightOpen = false;
         if ($(window).width() < 1100) {
            if ($('#sidebar-right').hasClass('sidebar-right-toggled')) {
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
      bClicked: function(event) {
         console.error('debug3');
         // do not open menu when user clicks on arrows
         if (event.target.className.indexOf('link-arrow') != -1) {
            return;
         }
         if ($(window).width() < 1100) {
            if (!$('#headerContainer').hasClass('menu-toggled')) {
               $scope.layout.menuOpen = true;
               $scope.layout.toggleMenu();
            }
         } else {
            if ($('#headerContainer').hasClass('menu-toggled')) {
               $scope.layout.menuOpen = true;
               $scope.layout.toggleMenu();
            }
         }
      },
      breadcrumbsClicked: function(event) {
         // do not close menu when user clicks on link
         if (!config.domains.current.clickableMenu || event.target.parentNode.parentNode.className.indexOf('breadcrumbs-item') != -1 || event.target.className.indexOf('link-arrow') != -1) {
            return;
         }
         console.error('debug2');
         $scope.layout.menuOpen = !$scope.layout.menuOpen;
         $scope.layout.toggleMenu();
         if ($(window).width() < 1100) {
            if ($('#headerContainer').hasClass('menu-toggled')) {
               $scope.layout.menuOpen = false;
            }
         } else {
            if (!$('#headerContainer').hasClass('menu-toggled')) {
               $scope.layout.menuOpen = false;
            }
         }
      },
      openRight: function() {
         if ($(window).width() < 1100) {
            if (!$('#sidebar-right').hasClass('sidebar-right-toggled')) {
               $scope.layout.rightOpen = true;
               $scope.layout.toggleRight();
            }
         } else {
            if ($('#sidebar-right').hasClass('sidebar-right-toggled')) {
               $scope.layout.rightOpen = true;
               $scope.layout.toggleRight();
            }
         }
      },
      openLeft: function() {
         if ($scope.layout.leftOpen) {
            $scope.layout.closeLeft();
            return;
         }
         if ($(window).width() < 1100) {
            if (!$('#sidebar-left').hasClass('sidebar-left-toggled')) {
               $scope.layout.leftOpen = true;
               $scope.layout.toggleLeft();
            }
         } else {
            if ($('#sidebar-left').hasClass('sidebar-left-toggled')) {
               $scope.layout.leftOpen = true;
               $scope.layout.toggleLeft();
            }
         }
      },
      closeIfOpen: function() {
         if ($scope.layout.leftOpen) {
            $scope.layout.closeLeft();
         }
         if ($scope.layout.menuOpen && !$scope.mapInfos.mapMode) {
            console.error('debug0');
            $scope.layout.closeMenu();
         }
      }
    };
    $scope.toggleFullscreen = function() {
      if ($scope.layout.state == "normal") {

      } else {

      }
    };
   function fixArrowPositions() {
      if ($('#sidebar-left').hasClass('sidebar-left-toggled') != $('.main-left-arrow').hasClass('main-left-arrow-toggled')) {
         $('.main-left-arrow').toggleClass('main-left-arrow-toggled')
      }
      if ($('#sidebar-right').hasClass('sidebar-right-toggled') != $('.main-right-arrow').hasClass('main-right-arrow-toggled')) {
         $('.main-right-arrow').toggleClass('main-right-arrow-toggled')
      }
   }
   var lastRightIsFullScreen;
   $scope.layout.rightIsFullScreen = function(rightIsFullScreen) {
      if (rightIsFullScreen == lastRightIsFullScreen) {
         fixArrowPositions();
         return;
      }
      console.error('debug1');
      lastRightIsFullScreen = rightIsFullScreen;
       if (rightIsFullScreen) {
         if (!$scope.mapInfos.mapMode) {
            $scope.layout.closeMenu();
         }
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
       fixArrowPositions();
       $scope.layout.refreshSizes();
    };
    var isCurrentlyOnePage = !config.domains.current.useLeftNavigation;
    $scope.layout.isOnePage = function(isOnePage) {
       if (config.domains.current.useLeftNavigation) {
          if (typeof isOnePage === 'undefined') {
             return isCurrentlyOnePage || $rootScope.mapInfos.mapMode;
          }
          isCurrentlyOnePage = isOnePage;
       } else {
          return true;
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
       if (lastRightIsFullScreen) { // things are handled automatically for everything but the task layout
          var availableMainWidth = $('#main-area').width();
          var minWidth = $('#task-right').css('min-width');
          if (!minWidth) {minWidth = '0px';}
          minWidth = parseInt(minWidth.slice(0,-2));
          if (!minWidth) {minWidth = 800;}
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
