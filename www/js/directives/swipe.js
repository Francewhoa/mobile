/*global define*/

define(['angular'], function (angular) {
    "use strict";

    var directive = function ($rootScope, Client, Cacher, $ionicGesture, $timeout, $ionicLoading, $compile) {
	  	return {
       		restrict: 'A',
       		scope: {
       			swipeOnLeft: '&swipeOnLeft',
       			swipeOnRight: '&swipeOnRight',
       			swipeOnUp:	'&swipeOnUp',
       			swipeOnDown: '&swipeOnDown'
       		},
			link: function(scope, element, attrs) {
				

				$ionicGesture.on('dragstart', function(e){
					e.preventDefault();
					
					var width = 320;
					var point = window.innerWidth / 2 + 1 * (width / 2)
					var distance = Math.abs(point - e.gesture.touches[0].pageX);// - window.innerWidth/2);
					//console.log(width, point, distance);
				}, element);
				
				$ionicGesture.on('drag', function(e){
					e.preventDefault();
									
					var o = e.gesture.deltaX / -1000;
					var rotationAngle = Math.atan(o);
										
					var x = (e.gesture.deltaX * 0.8);
					var y = (e.gesture.deltaY * 0.8);
					
					if(attrs.swipeDisableVertical){
						y = 0;
					}
					
					element.css('webkitTransform', 'translate3d(' + x + 'px, ' + y + 'px, 0) rotate(' + (rotationAngle || 0) + 'rad)');
					//element.css('z-index', 99999999);
					
				}, element);
				
				$ionicGesture.on('dragend', function(e){
					
					element.css('webkitTransform', 'none');
					console.log('you let go!');
					
					var right_threshold = 100;
					var left_threshold = -100;
					var up_threshold = -140;
					var down_threshold = 140;
					
					if(e.gesture.deltaX > right_threshold){
						console.log('you swiped right');
						scope.swipeOnRight();
						return true;
					}
					
					if(e.gesture.deltaX < left_threshold){
						console.log('you swiped left');
						scope.swipeOnLeft();
						return true;
					}
					
					if(attrs.swipeDisableVertical){
						return true;
					}
					
					if(e.gesture.deltaY < up_threshold){
						console.log('you swiped up');
						scope.swipeOnUp();
						return true;
					}
					
					if(e.gesture.deltaY > down_threshold){
						console.log('you swiped down');
						scope.swipeOnDown();
						return true;
					}
					
				}, element);
				
				
			
			}
       	 };
    };

    directive.$inject = ['$rootScope', 'Client', 'Cacher', '$ionicGesture', '$timeout', '$ionicLoading', '$compile'];
    return directive;
});