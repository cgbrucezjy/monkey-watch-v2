angular.module('directives', [])
.directive('youtube', function($window, YT_event,$interval) {
  return {
    restrict: "E",

    scope: {
      height: "@",
      width: "@",
      videoid: "@"
    },

    template: '<div><p>Please try refresh first then re-enter the room</p></div>',

    link: function(scope, element, attrs, $rootScope) {
      var tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      var firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      
      var player;
      var stop;

        $window.onYouTubeIframeAPIReady = function() {
          console.log($window['YT']);
          $window['YT'].loading=0;
          document.getElementById("progressBar").value=0;
        player = new YT.Player(element.children()[0], {
          playerVars: {
            autoplay: 0,
            html5: 1,
            theme: "light",
            modesbranding: 0,
            color: "white",
            iv_load_policy: 3,
            showinfo: 1,
            controls: 0
          },
          
          height: scope.height,
          width: scope.width,
          videoId: scope.videoid, 

          events: {
            'onStateChange': function(event) {
              
              var message = {
                event: YT_event.STATUS_CHANGE,
                data: ""
              };
              
              switch(event.data) {
                case YT.PlayerState.PLAYING:
                  message.data = "PLAYING";
                    $('#progressBar').show();
                    var playerTotalTime = player.getDuration();
                    stop=$interval(function() {
                        var playerCurrentTime = player.getCurrentTime();

                        var playerTimeDifference = (playerCurrentTime / playerTotalTime)*100;
                        document.getElementById("progressBar").value=playerTimeDifference;

                        //console.log(playerTimeDifference);
                    }, 1000);

                  break;
                case YT.PlayerState.ENDED:
                  message.data = "ENDED";
                        
                  if (angular.isDefined(stop)) {
                        $interval.cancel(stop);
                        stop = undefined;
                    }
 
                  break;
                case YT.PlayerState.UNSTARTED:
                  message.data = "NOT PLAYING";
                  if (angular.isDefined(stop)) {
                        $interval.cancel(stop);
                        stop = undefined;
                    }
              
                  break;
                case YT.PlayerState.PAUSED:         
                  message.data = "PAUSED";
                  if (angular.isDefined(stop)) {
                        $interval.cancel(stop);
                        stop = undefined;
                    }
                  break;
              }

              scope.$apply(function() {
                scope.$emit(message.event, message.data);
              });
            }
          } 
        });
      };      

      scope.$on(YT_event.minScreen, function() {
  
        player.setSize(800, 600);
      
      });

      scope.$on(YT_event.maxScreen, function() {
  
        player.setSize(window.innerWidth || document.body.clientWidth, window.innerHeight || document.body.clientHeight);
      
      });
   
     scope.$on(YT_event.loadVideo, function () {
          console.log(document.getElementById("vid").value);
            player.cueVideoById(document.getElementById("vid").value);
      });

      scope.$on(YT_event.STOP, function () {
        player.seekTo(0);
        player.stopVideo();
      });

      scope.$on(YT_event.PLAY, function () {
        player.playVideo();
      }); 

      scope.$on(YT_event.PAUSE, function () {
        player.pauseVideo();
      });  
      
      scope.$on(YT_event.PAUSE, function () {
        player.pauseVideo();
      });      

      scope.$on(YT_event.seek, function () {
        if (angular.isDefined(stop)) {
            $interval.cancel(stop);
            stop = undefined;
        }

        var toValue=document.getElementById("progressBar").value/100*player.getDuration();
        player.seekTo(toValue);
        player.playVideo();
      });   



  
    }  
  };
})
.constant('YT_event', {
  minScreen:-5,
  maxScreen:-4,
    seek:-3,
    loadVideo:-2,
  ENDED:            -1,
  STOP:            0, 
  PLAY:            1,
  PAUSE:           2,
  STATUS_CHANGE:   3,
  CUED:             5

});