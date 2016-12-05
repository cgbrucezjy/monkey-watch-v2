angular.module('roomController', [])
	.controller('roomController', function($scope, $state,$location,$window,$http,$stateParams,YT_event,$firebaseArray,$timeout) {
  console.log(' id '+$stateParams.id);
  var customConfig=$stateParams.customConfig;
  console.log(customConfig);
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

  //$scope.currUser={username:'temp user'};
  $scope.roomUsers=$firebaseArray(ref.child("roomUsers"));
  $scope.peer = new Peer({　host:'peerjs-server-sggo.herokuapp.com', secure:true, port:443, key: 'peerjs', debug: 3})
  $scope.peer.on('open', function(id) {
    console.log('pid:',id)
    $scope.currUser={uname:$stateParams.uname,pid:id};
    $scope.roomUsers.$add($scope.currUser).then(function(r) {
      $scope.userId = r.key;
    });
  });
      navigator.getUserMedia({audio: true, video: true}, function(stream){
        // Set your video displays
         document.getElementById('myvids').src=window.URL.createObjectURL(stream);
        window.localStream = stream;
      }, function(){ console.log("error") });

    function step3 (call) {
      // Hang up on an existing call if present
      if (window.existingCall) {
        window.existingCall.close();
      }
      // Wait for stream on the call, then set peer video display
      call.on('stream', function(stream){
        document.getElementById('remotevids').src=window.URL.createObjectURL(stream);
      });
      // UI stuff
      window.existingCall = call;
    }
  
    $scope.peer.on('call', function(call){
      console.log("got called")
      // Answer the call automatically (instead of prompting user) for demo purposes
      call.answer(window.localStream);
      step3(call);
    });
    $scope.connect=function(pid)
    { 
      console.log(pid);
      $scope.call = $scope.peer.call(pid, window.localStream);
      step3($scope.call);
    }
  // navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

  
  // $scope.peer.on('call', function(call) {
  //   navigator.getUserMedia({video: true, audio: false}, function(stream) {
  //     call.answer(stream); // Answer the call with an A/V stream.
  //     call.on('stream', function(remoteStream) {
  //       var video = document.getElementById('remotevids');
  //       video.src = window.URL.createObjectURL(stream);
  //     });
  //   }, function(err) {
  //     console.log('Failed to get local stream' ,err);
  //   });
  // });

$scope.mute=function(){
  $scope.un_mute=!$scope.un_mute;
  var audioElm = document.getElementById('remotevids'); audioElm.muted =$scope.un_mute;
  console.log(audioElm.muted);
}

var first={seek:1,start:1,pause:1,load:1};
$scope.min_text='movetxt';
$scope.videoc='video';


console.log($stateParams);
$scope.chat=$firebaseArray(ref.child("chat"));
 //initial settings
  $scope.yt = {
    width: 600, 
    height: 480, 
    videoid: $stateParams.vid.substring($stateParams.vid.indexOf('v=')+2) || "21T9yd2Um0E",
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
      
    ref.child("pause").once("value", function(data) {
      ref.update({"pause":!data.val()}); 
      console.log('is playing '+$scope.isPlaying);
    });
    
    
  };

  $scope.play=function(){
      
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
          var url=dataSnapshot.val();
          var vid=url.substring(url.indexOf('v=')+2);
          document.getElementById("vid").value=url;
           
      
          $scope.sendControlEvent($scope.YT_event.loadVideo);
          ref.update({'imgsrc':'//img.youtube.com/vi/'+vid+'/0.jpg'});
        }
        else{
          first.load=first.see+1;
        }

    });  

  ref.child("play").on('value', function(dataSnapshot) {
          $scope.isPlaying = true;
          console.log("changed"+dataSnapshot.val());
          $scope.sendControlEvent($scope.YT_event.PLAY);
  
    });

  ref.child("pause").on('value', function(dataSnapshot) {
          $scope.isPlaying = false;
          console.log("changed"+dataSnapshot.val());
          $scope.sendControlEvent($scope.YT_event.PAUSE);
 
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

  var timedelay = 1;
  $scope.sendMessageByEnter=function($event){
    $('#progressBar').fadeIn();
    $('#chat').fadeIn();
        timedelay = 1;
        clearInterval(_delay);
        _delay = setInterval(delayCheck, 1000);
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
    console.log("script");
    
    function delayCheck()
    {
        if(timedelay == 5 && $scope.isMax)
        {
          $('#progressBar').fadeOut();
          $('#chat').fadeOut();

            timedelay = 1;
        }
        timedelay = timedelay+1;
    }
    
    $(document).mousemove(function() {
        $('#progressBar').fadeIn();
        $('#chat').fadeIn();
        
        
        timedelay = 1;
        clearInterval(_delay);
        _delay = setInterval(delayCheck, 1000);
    });


    // page loads starts delay timer
    _delay = setInterval(delayCheck, 1000);



}).constant('config',{
  'baseUrl':''
});

