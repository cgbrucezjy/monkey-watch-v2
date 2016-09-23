angular.module('homeController', [])
	.controller('homeController', function($scope, $state,YT_event) {
var first={seek:0,start:0,pause:0};
 //initial settings
  $scope.yt = {
    width: 600, 
    height: 480, 
    videoid: "21T9yd2Um0E",
    playerStatus: "NOT PLAYING"
  };

  $scope.YT_event = YT_event;

  $scope.sendControlEvent = function (ctrlEvent) {
    this.$broadcast(ctrlEvent);
  }

  $scope.$on(YT_event.STATUS_CHANGE, function(event, data) {
      $scope.yt.playerStatus = data;
  });


  var ref = firebase.database().ref().child("BruceRoom");

  $scope.seek=function(seek){
    console.log(seek); 
    ref.update({"seek":seek}); 
    
  };
  $scope.pauses=true;
  $scope.pause=function(){
    $scope.pauses=!$scope.pauses;
    console.log($scope.pauses);
    ref.update({"pause":$scope.pauses}); 
    
  };
  $scope.plays=true;
  $scope.play=function(){
    $scope.plays=!$scope.plays;
    console.log($scope.plays);
    ref.update({"play":$scope.plays}); 
    
  };
  ref.child("seek").on('value', function(dataSnapshot) {
        console.log("changed"+dataSnapshot.val());
        if(first.seek!=0)
        {
          document.getElementById("progressBar").value=dataSnapshot.val();
          $scope.sendControlEvent($scope.YT_event.seek);
        }
        else{
          first.seek=first.see+1;
        }

    });  
  ref.child("pause").on('value', function(dataSnapshot) {
        if(first.pause!=0)
        {
          console.log("changed"+dataSnapshot.val());
          $scope.sendControlEvent($scope.YT_event.PAUSE);
        }
        else{
          first.pause=first.pause+1;
        }  
    });
  ref.child("play").on('value', function(dataSnapshot) {
        if(first.start!=0)
        {
          console.log("changed"+dataSnapshot.val());
          $scope.sendControlEvent($scope.YT_event.PLAY);
        }
        else{
          first.start=first.start+1;
        }  
    });


  $scope.restart=function(){

    document.getElementById("progressBar").value=0;
    ref.update({"seek":0}); 
    this.$broadcast($scope.YT_event.seek);
  };
});