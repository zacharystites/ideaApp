var idealy = angular.module("idealy", ["firebase", 'ui.bootstrap']);

idealy.run(['angularFireAuth', function(angularFireAuth){
	var url = "https://idea-app.firebaseio.com/";
	angularFireAuth.initialize(url, {'name':'user', 'path':'/'});
}]);

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
	}).when("/idea", {
		templateUrl: "views/newidea.html",
		controller: "idea",
		authRequired: true
	})

});

idealy.controller("user",['$scope', 'angularFireAuth',"$location", function($scope, angularFireAuth, $location){
	$scope.location = $location;
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

idealy.controller("ideas", ['$scope', 'angularFireCollection', function($scope, angularFireCollection){
	var url="https://idea-app.firebaseio.com/idea";
	$scope.ideas = angularFireCollection(url);
}]);

idealy.controller("idea", ['$scope', 'angularFireCollection', '$rootScope', '$routeParams', function($scope, angularFireCollection, $rootScope, $routeParams){
	var url="https://idea-app.firebaseio.com/idea";
	var collection = angularFireCollection(url,function(data)
		{
			if($routeParams.projectId)
			{
				console.log(data.val());
				$scope.idea = data.val()[ $routeParams.projectId ] ;	
			}
			
		});
	$scope.saveIdea = function(){
		$scope.idea.userId = $rootScope.user.id;
		$scope.idea.createdDate = new Date().getTime();
		collection.add($scope.idea);
	};
}]);