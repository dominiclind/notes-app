var app = angular.module('notes', ['ui.router' , 'ngAnimate', 'dropstore-ng']);


//r

app.config(['$stateProvider', '$urlRouterProvider', '$httpProvider',
    function($stateProvider, $urlRouterProvider, $httpProvider) {
        $httpProvider.defaults.withCredentials = true;
        $urlRouterProvider.otherwise('notes');


		$stateProvider
		    .state('notes', {
		        url: "/notes",
		        templateUrl: 'views/notes.html',
		        controller : 'NotesCtrl'
		    })
		    .state('note', {
		        url: "/note/:id",
		        templateUrl: 'views/note.html',
		        controller : 'NoteCtrl'
		    })

    }
]);

app.run(['$rootScope', '$urlRouter', '$state',
    function($rootScope, $urlRouter, $state) {
        
        $rootScope.$on('$stateChangeSuccess', function(e, toState, toParams, fromState, fromParams) {
            
            $rootScope.currentStateName = toState.name;
            
            if(toState.name == 'notes'){
            	$rootScope.editNote = false;
            }else{
            	$rootScope.editNote = true;
            }
        })
    }
]);



app.controller('MainCtrl', ['$scope', '$rootScope', 'dropstoreClient',function ($scope, $rootScope, dropstoreClient) {

	// auth with dropbox

	$scope.signOutDropBox = function() {
		dropstoreClient.signOut().then(function(res){
			console.log("user is logged OUT");
		});
	}

	$scope.authWithDropBox = function(){
		dropstoreClient.create({key: 'c3tbpsz8lua83ji'})
	    .authenticate({interactive: true})
	    .then(function(datastoreManager){
	        datastoreManager.openDefaultDatastore().then(function(datastore){
	        	var notesTable = datastore.getTable('notes');
	        	var dropboxNotes = notesTable.query();

	        	$scope.dropBoxNotes = [];

	        	for(var i = 0 ; i < dropboxNotes.length; i++){
	        		var note = dropboxNotes[i];
	        		var obj = {
	        			text : note.get('note')
	        		};
	        		$scope.dropBoxNotes.push(obj);
	        	}


	        });
	    });
    }



	//state listens
	$rootScope.$on('new', function(e, note){
		console.log("Created note with id : " + note.id);
	});	

	$rootScope.$on('edited', function(e, note){
		console.log("Edited note with id : " + note.id);
	});	

	$rootScope.$on('deleted', function(e, note){
		console.log("Deleted note with id : " + note.id);
	});	
}])

app.controller('NoteCtrl', ['$scope', '$rootScope', '$stateParams', '$state' ,'Storage', function ($scope, $rootScope, $stateParams, $state, Storage) {

	var savedNote = Storage.getNote($stateParams.id) || {
		id : $stateParams.id,
		note : '',
	};

	$scope.note = savedNote;

	$scope.$watch('note.note', function(){

		if($scope.note.note.length > 0){
			Storage.saveNote($scope.note);
		}else{
			$scope.edit = true;
		}
	});

	// public
	$scope.toggleEdit = function() {
		$scope.edit = !$scope.edit;
	}
	$scope.viewNotes = function () {
		$state.go('notes');
	}

	$scope.previewNote = function () {
			
	}

}])

app.controller('NotesCtrl', ['$scope', '$rootScope' ,'Storage', '$state', function ($scope, $rootScope, Storage, $state) {
	console.log("notes ctrl");

	$scope.notes = Storage.getNotes();

	$rootScope.$on('deleted', function(e){
		$scope.notes = Storage.getNotes();
	});	


	// public
	$scope.newNote = function() {
		$state.go('note', {id : new Date().getTime()});
	}

	$scope.viewNote = function(note) {
		$state.go('note', {id : note.id});
	}

	$scope.deleteNote = function(note) {
		console.log("DELETE NOTE : " + note.id);
		Storage.deleteNote(note);
	}

}])


app.controller('NavCtrl', ['$scope', '$rootScope', '$state' ,'Storage', function ($scope, $rootScope, $state, Storage) {



}])







// Storage
app.factory('Storage', ['$window', '$rootScope', function ($window, $rootScope) {

	
	return {

		getNotes : function() {
			var notes = $window.localStorage.getItem('notes') || [];

			if(angular.isString(notes)){
				return JSON.parse(notes);
			}else{
				return notes;
			}
			
		},

		getNote : function(id) {
			var notes = this.getNotes();

			var found = false;
			for(key in notes){
				if(notes[key].id == id){
					found = notes[key];
				}
			}

			return found;

		},

		deleteNote : function(note) {
			var notes = this.getNotes();

			for(key in notes){
				if(notes[key].id == note.id){
					notes.splice(key,1);
				}
			}

			$window.localStorage.setItem('notes', JSON.stringify(notes));
			$rootScope.$emit('deleted', note);

		},
		
		saveNote : function(note) {
			var notes = this.getNotes();

			var action = '';
			for(key in notes){

				if(notes[key].id == note.id){
					notes[key] = note;
					action = 'edited';
				}
			}

			if(action != 'edited'){
				notes.push(note);
				action = 'new';
			}

			$window.localStorage.setItem('notes', JSON.stringify(notes));
			$rootScope.$emit(action, note);
		}

	};

}])


// debounce
app.directive('debounce', ['$timeout',function ($timeout) {
	return {
      restrict: 'A',
      require: 'ngModel',
      priority: 99,
      link: function (scope, elm, attr, ngModelCtrl) {
          if (attr.type === 'radio' || attr.type === 'checkbox') {
              return;
          }

          var delay = parseInt(attr.debounce, 10);
          if (isNaN(delay)) {
              delay = 1000;
          }

          elm.unbind('input');
          
          var debounce;
          elm.bind('input', function () {
              $timeout.cancel(debounce);
              debounce = $timeout(function () {
                  scope.$apply(function () {
                      ngModelCtrl.$setViewValue(elm.val());
                  });
              }, delay);
          });
          elm.bind('blur', function () {
              scope.$apply(function () {
                  ngModelCtrl.$setViewValue(elm.val());
              });
          });
      }
    }

}])


// markdown 

app.filter('markdown', function ($sce) {
    var converter = new Showdown.converter();
    return function (value) {
		var html = converter.makeHtml(value || '');
        return $sce.trustAsHtml(html);
    };
});