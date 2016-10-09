angular.module('roomController', [])
	.controller('roomController', function($scope, $state,$location,$window,$stateParams,YT_event,$firebaseArray,$timeout) {

  $scope.currUser={username:'temp user'};
  
  console.log(' id '+$stateParams.id);
  if($stateParams.id=="")
  {
    var ref = firebase.database().ref().child($stateParams.roomId);
    $scope.shareLink=$location.$$absUrl+$stateParams.roomId;
  }
  else
  {
    var ref = firebase.database().ref().child($stateParams.id);
    $scope.shareLink=$location.$$absUrl;
  }

  $scope.roomUsers=$firebaseArray(ref.child("roomUsers"));
  $scope.roomUsers.$add($scope.currUser).then(function(r) {
    $scope.userId = r.key;
  });


var first={seek:1,start:1,pause:1,load:1};
$scope.min_text='movetxt';
$scope.videoc='video';


console.log($stateParams);
$scope.chat=$firebaseArray(ref.child("chat"));
 //initial settings
  $scope.yt = {
    width: 600, 
    height: 480, 
    videoid: $stateParams.vid || "21T9yd2Um0E",
    playerStatus: "NOT PLAYING"
  };

  $scope.YT_event = YT_event;
  $scope.sendMessage=function(m){
    document.getElementById("messageBox").value="";
    $scope.chat.$add(m);
  };



  $scope.sendControlEvent = function (ctrlEvent) {
    this.$broadcast(ctrlEvent);
  };

  $scope.$on(YT_event.STATUS_CHANGE, function(event, data) {
      $scope.yt.playerStatus = data;
  });


 
  ref.child('background').once('value',function(snap){
    console.log(snap.val());
    document.body.className =' '+snap.val();
  });

  $scope.seek=function(seek){
    console.log(seek); 
    ref.update({"seek":seek}); 
    
  };
$scope.isPlaying = false;
  $scope.pause=function(){
      $scope.isPlaying = false;
    $scope.pauses=!$scope.pauses;
    console.log($scope.pauses);
    ref.child("pause").once("value", function(data) {
      ref.update({"pause":!data.val()}); 
    });
    
    
  };
  $scope.plays=true;
  $scope.play=function(){
      $scope.isPlaying = true;
    $scope.plays=!$scope.plays;
    ref.child("play").once("value", function(data) {
      ref.update({"play":!data.val()}); 
    });
    
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
  ref.child("load").on('value', function(dataSnapshot) {
        console.log("changed"+dataSnapshot.val());
        if(first.load!=0)
        {
          document.getElementById("vid").value=dataSnapshot.val();
          $scope.sendControlEvent($scope.YT_event.loadVideo);
          ref.update({'imgsrc':'//img.youtube.com/vi/'+dataSnapshot.val()+'/0.jpg'});
        }
        else{
          first.load=first.see+1;
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
  ref.child("chat").on('child_added', function(dataSnapshot) {

        $timeout(function () {
          console.log(dataSnapshot.key);
          $scope.chat.$remove(0);
      }, 1000);
    });

  $scope.restart=function(){

    document.getElementById("progressBar").value=0;
    ref.update({"seek":0}); 
    this.$broadcast($scope.YT_event.seek);
  };
  $scope.isMax=false;
  $scope.maxScreen=function(){
    $scope.isMax=true;
    var video = document.getElementById('video');
    video.style.position = "absolute";
    video.style.left = '0px';
    video.style.top = '0px';
    video.style.width=document.body.clientWidth+"px";
    video.style.height=document.body.clientHeight+"px";
    var progress = document.getElementById('progressBar');
    progress.style.position = "absolute";
    progress.style.left = '0px';
    progress.style.bottom = '55px';

    progress.style.width=document.body.clientWidth+"px";
    var chatbox = document.getElementById('chat');
    chatbox.style.position = "absolute";
    chatbox.style.left = '0px';
    chatbox.style.bottom = '0px';

    chatbox.style.width=document.body.clientWidth+"px";

    $scope.sendControlEvent(YT_event.maxScreen);

  };

  var minWdith=800;
  var minheight=600;
  $scope.minScreen=function(){
    $scope.isMax=false;
    var video = document.getElementById('video');
    video.style.position = "relative";
    video.style.left = '';
    video.style.top = '';
    video.style.width=minWdith+"px";
    video.style.height=minheight+"px";
    var progress = document.getElementById('progressBar');
    progress.style.position = "relative";
    progress.style.left = '';
    progress.style.bottom = '';

    progress.style.width=minWdith+"px";
    var chatbox = document.getElementById('chat');
    chatbox.style.position = "relative";
    chatbox.style.left = '';
    chatbox.style.bottom = '';

    chatbox.style.width=minWdith+"px";

    $scope.sendControlEvent(YT_event.minScreen);   
  }


  $scope.sendMessageByEnter=function($event){
    console.log($event.keyCode);
    if($event.keyCode==13)
    {
      var text= $scope.message;
      $scope.sendMessage(text);
    }
  };

  $scope.loadVideo=function(vid){
    console.log(vid);
    ref.update({"load":vid}); 
  };
  $scope.goBack=function(){
    var c=document.getElementsByTagName('script');

    c[0].parentElement.removeChild(c[0]); 
    c[0].parentElement.removeChild(c[0]); 
    $scope.onExit();
        
    $state.go('home');
  };
  $scope.onExit = function() {
    var index=$scope.roomUsers.$indexFor($scope.userId);
    if(index!=-1)
    {
      $scope.roomUsers.$remove(index);
    }
    
  };
  $scope.$on('$locationChangeStart', function (event, next, current) {
                    console.log('current '+current);
                    if (current.match("\/room") && next.indexOf("\/room")<0) {
                      var c=document.getElementsByTagName('script');

                      c[0].parentElement.removeChild(c[0]); 
                      c[0].parentElement.removeChild(c[0]); 
                      $scope.onExit();
                    }
                });
  $window.onbeforeunload =  $scope.onExit;


}).constant('config',{
  'baseUrl':''
});