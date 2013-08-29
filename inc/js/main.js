var idealy = angular.module("idealy", ["firebase", 'ui.bootstrap']);

idealy.run(['angularFireAuth', function(angularFireAuth){
	var url = "https://idea-app.firebaseio.com/";
	angularFireAuth.initialize(url, {'name':'user', 'path':'/'});
}]);

var colors = ["icon-green", "icon-pink", "icon-red", "icon-teal", "icon-orange", "icon-blue"];

idealy.config(function($routeProvider){
	$routeProvider.when("/", {
		templateUrl: "views/signup.html",
		controller: "user",
		authRequired: false
	}).when("/login", {
		templateUrl: "views/login.html",
		controller: "user",
		authRequired: false
	}).when("/ideas", {
		templateUrl: "views/userdash.html",
		controller: "ideas",
		authRequired: true
	}).when("/idea/:projectId", {
		templateUrl: "views/viewIdea.html",
		controller: "idea",
		authRequired: true
	}).when("/idea/new", {
		templateUrl: "views/newidea.html",
		controller: "idea",
		authRequired: true
	}).when("/idea/:type/:projectId", {
		templateUrl: "views/newidea.html",
		controller: "idea",
		authRequired: true
	})

});

idealy.controller("Core", ['$scope', '$location', function($scope, $location){
	$scope.location = $location;
	$scope.bodyClass='img_background';
}]);

idealy.controller("user",['$scope', 'angularFireAuth',"$location", function($scope, angularFireAuth, $location){
	$scope.location = $location;
	$scope.logintext = "log in";
	$scope.signup = function(){
		if($scope.validatePassword()){
			angularFireAuth.createUser($scope.user.email, $scope.user.password, function(user){
				if(user){
					$location.path("/ideas");
				}
			});
			$scope.user = {};
		}else {
			console.log("FUCK")
		}
		
	};
	$scope.login = function(){
		$scope.logintext = "loading..";
		angularFireAuth.login("password", $scope.user).then(function(){

			$location.path("/ideas");
		});
	}
	$scope.signout = function(){
		console.log('user signed out');
		angularFireAuth.logout();
		$scope.user = null;
	};
	$scope.validatePassword = function(){
		return $scope.user.password === $scope.user.confirm;
	}
}]);

idealy.controller("ideas", ['$scope', 'angularFireCollection', '$location', function($scope, angularFireCollection, $location){
	var url="https://idea-app.firebaseio.com/idea";
	$scope.bodyClass='';
	$scope.ideas = angularFireCollection(url);
	$scope.icons = {
		finance: "icon-briefcase",
		eCommerce: "icon-shopping-cart",
		food: "icon-glass",
		health: "icon-heart",
		webApp: "icon-globe",
		phoneApp: "icon-camera"
	}
	$scope.deleteStatus = {state:false};
	console.log('$scope.deleteStatus',$scope.deleteStatus);

	$scope.viewIdea = function(id) {
		$location.path("/idea/"+id);
	}

	$scope.deleteIdea = function(id,$event) {
		$scope.ideas.remove(id);
		$event.stopPropagation();
		$event.cancelBubble = true;
	}	

	$scope.deleteStatus = function() {
		if ($scope.deleteStatus.state == true){
			$scope.deleteStatus.state = false;
		}else{
			$scope.deleteStatus.state = true;
		}
	}
}]);

idealy.controller("idea", ['$scope', 'angularFireCollection', '$rootScope', '$routeParams', '$location', '$timeout', function($scope, angularFireCollection, $rootScope, $routeParams, $location,$timeout){
	var url="https://idea-app.firebaseio.com/idea";
	$scope.location = $location;
	$scope.bodyClass='';



	$scope.ideas = angularFireCollection(url);

	var time_to_end = 4000;
	var timer = function(){
		$timeout(function()
		{
			time_to_end--;
			if($scope.ideas.length === 0 && time_to_end > 0)
			{
				timer();
			}
			else
			{
				for(key in $scope.ideas)
				{
					if($scope.ideas[key].$id == $routeParams.projectId)
					{
						$scope.idea = $scope.ideas[key];

						break;
					}
				}
			}
		},10)
	}
		
	timer();

	$scope.saveIdea = function(){
		$scope.bodyClass='';
		$scope.idea.userId = $rootScope.user.id;
		$scope.idea.createdDate = new Date().getTime();
		if($routeParams.type == "edit")
		{
			$scope.ideas.update($scope.idea, function(){
				window.location = '#/ideas';
			});
		}
		else
		{
			$scope.ideas.add($scope.idea, function(){
				window.location = '#/ideas';
			});
		}
		
	};
}]);