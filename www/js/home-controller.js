angular.module('homeController', [])
	.controller('homeController', function($scope, $state,YT_event,$firebaseArray,$http,$timeout,$mdDialog,$templateCache) {
        var ref = firebase.database().ref()
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
        .title('Name')
        .textContent('Enter your display name')
        .placeholder('hexor')
        .ariaLabel('User Name')
        .initialValue('hexor')
        .targetEvent(ev)
        .ok('Create')
        .cancel('Cancel');     
        $mdDialog.show(confirm).then(function(uname) {
            console.log(rName);
            var roomInfo={'roomName':rName,'uname':uname}
              $scope.enterRoom(roomInfo,false);
        }, function() {
        });       
    }, function() {
     
    });
  };

$scope.enterRoomNum=function(tile){
    console.log(tile.$id);
    var roomInfo={'roomId':tile.$id,'roomName':tile.roomName,'password':'',vid:tile.load};
    $scope.enterRoom(roomInfo,true);
}
$scope.enterRoom=function(roomInfo,exist){
    
    
    // $templateCache.removeAll();
    // console.log($templateCache.get("views/room.html"));


    console.log('getCustomConfig');
    var req = {
      method: 'POST',
      url: 'https://limitless-ridge-46428.herokuapp.com/rest/xirsys',
      //url: 'https://service.xirsys.com/ice',
      data: {
            ident: "cgbrucezjy",
            secret: "98599a1c-b5aa-11e6-96fc-3ecad2f849ae",
            domain: "www.sggo.com",
            application: "monkey-watch",
            room: "default",
            secure: 1
          }
      }

      $http(req).then(function(resp){
        console.log(resp);
        roomInfo.customConfig=resp.data.d
        if(exist)
        {
          var unameConf = $mdDialog.prompt()
            .title('Name')
            .textContent('Enter your display name')
            .placeholder('hexor')
            .ariaLabel('User Name')
            .initialValue('hexor')
            .ok('Enter')
            .cancel('Cancel');     
            $mdDialog.show(unameConf).then(function(uname) {
              console.log(uname);
                roomInfo.uname=uname;
                $state.go('room',roomInfo); 
            }, function() {
            });  
                   
        }
        else
        {
            var ran=Math.floor((Math.random() * 15) + 1);
            var it=$scope.getRoomSetting(ran);
            console.log(' ',it);
          $scope.tiles.$add({roomName:roomInfo.roomName,row:it.row,col:it.col,background:it.background,imgsrc:"xxx.jpg"}).then(function(ref) {
              var id = ref.key;
              roomInfo.id=id;
              $state.go("room",roomInfo);
          });
            
        }
      }, function(){});



    
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
