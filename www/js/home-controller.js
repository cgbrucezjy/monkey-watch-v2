angular.module('homeController', [])
	.controller('homeController', function($scope, $state,YT_event,$firebaseArray,$timeout,$mdDialog,$templateCache) {

    $scope.createRoom=function(ev) {
    // Appending dialog to document.body to cover sidenav in docs app
    var confirm = $mdDialog.prompt()
      .title('Creating Room')
      .textContent('Enter room Name')
      .placeholder('room name')
      .ariaLabel('Rome name')
      .initialValue('')
      .targetEvent(ev)
      .ok('Next')
      .cancel('Cancel');

    $mdDialog.show(confirm).then(function(rName) {
        confirm = $mdDialog.prompt()
        .title('Password?')
        .textContent('Do you need password')
        .placeholder('password')
        .ariaLabel('Rome password')
        .initialValue('')
        .targetEvent(ev)
        .ok('Create')
        .cancel('Skip');     
        $mdDialog.show(confirm).then(function(pass) {
            console.log(rName);
            var roomInfo={'roomName':rName,'password':pass}
              $scope.enterRoom(roomInfo);
        }, function() {
            console.log(rName);
            var roomInfo={'roomName':rName,'password':''}
            $scope.enterRoom(roomInfo);
           
        });       
    }, function() {
     
    });
  };
var ref = firebase.database().ref();
$scope.enterRoomNum=function(tile){
    console.log(tile);
    var roomInfo={'roomName':tile.$id,'password':'',vid:tile.load};
    $scope.enterRoom(roomInfo);
}
$scope.enterRoom=function(roomInfo){
    
    
    // $templateCache.removeAll();
    // console.log($templateCache.get("views/room.html"));
    ref.child(roomInfo.roomName).once("value", function(data) {
      if(data.exists())
      {
          $state.go('room',roomInfo);
      }
      else
      {
          var ran=Math.floor((Math.random() * 15) + 1);
          var it=$scope.getRoomSetting(ran);
          console.log(' ',it);
          ref.child(roomInfo.roomName).update({row:it.row,col:it.col,background:it.background,imgsrc:"xxx.jpg"});
           $state.go("room",roomInfo);
      }
      
    });
    
};

$scope.tiles=$firebaseArray(ref);


    $scope.getRoomSetting=function(j){
        var it={};
        it.row=1;
        it.col=1;
        switch((j+1)%11) {
          case 1:
            it.background = "red";
            it.row = it.col = 2;
            break;

          case 2: it.background = "green";         break;
          case 3: it.background = "darkBlue";      break;
          case 4:
            it.background = "blue";
            it.col = 2;
            break;

          case 5:
            it.background = "yellow";
            it.row = it.col = 2;
            break;

          case 6: it.background = "pink";          break;
          case 7: it.background = "darkBlue";      break;
          case 8: it.background = "purple";        break;
          case 9: it.background = "deepBlue";      break;
          case 10: it.background = "lightPurple";  break;
        }
        
        return it;
    };
});
