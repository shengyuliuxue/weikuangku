
      var basepath = 'http://127.0.0.1:5000';
      var wangjiaping = ol.proj.fromLonLat([110.01, 34.24]);
      var map = new ol.Map({
        target: 'map',
        layers: [
          new ol.layer.Tile({
                source: new ol.source.XYZ({
                        url: 'http://mt2.google.cn/vt/lyrs=y&hl=zh-CN&gl=CN&src=app&x={x}&y={y}&z={z}&s=G'
                        }),
                projection: 'EPSG:3857'
          })
        ],
        view: new ol.View({
          center: wangjiaping,
          zoom: 8

        })
      });


      var marker = new ol.Overlay({
        position: wangjiaping,
        positioning:'center-center',
        element: document.getElementById('marker'),
        stopEvent:false
      });

      map.addOverlay(marker);


    var text = new ol.Overlay({
        position: wangjiaping,
        element: document.getElementById('address')
    });
    text.element.innerText='王家坪尾矿库';
    map.addOverlay(text);


    function addPoint(long, lat, name){

        var point = ol.proj.fromLonLat([long, lat]);
        //新增div元素
        var elementDiv = document.createElement('div');
        elementDiv.className = 'marker';
        elementDiv.title = name;
        var overlay = document.getElementById('label');
        overlay.appendChild(elementDiv);
        //设置a元素
        var elementA = document.createElement("a");
        elementA.className = "address";
        elementA.href = '#';


        elementA.innerText = elementDiv.title;

        elementDiv.appendChild(elementA);

        var newMarker = new ol.Overlay({
            position: point,
            positioning:'center-center',
            element: elementDiv,
            stopEvent:false
        });
        map.addOverlay(newMarker);
        newMarker.getElement().title= name;

        var newText = new ol.Overlay({
            position: point,
            element: elementA
        });
        map.addOverlay(newText);


    }


 function loadMultiPoint(long, lat, name){

        var point = ol.proj.fromLonLat([long, lat]);
        //新增div元素
        var elementDiv = document.createElement('div');
        elementDiv.className = 'pointmarker';
        elementDiv.title = name;
        var overlay = document.getElementById('pointlabel');
        overlay.appendChild(elementDiv);
        //设置a元素
        var elementA = document.createElement("a");
        elementA.className = "pointaddress";
        elementA.href = '#';


        elementA.innerText = elementDiv.title;

        elementDiv.appendChild(elementA);

        var newMarker = new ol.Overlay({
            position: point,
            positioning:'center-center',
            element: elementDiv,
            stopEvent:false
        });
        map.addOverlay(newMarker);
        newMarker.getElement().title= name;

        var newText = new ol.Overlay({
            position: point,
            element: elementA
        });
        map.addOverlay(newText);


    }



    //addPoint(110.017,34.2352,'王家坪尾矿库');
    addPoint(107.523, 23.4087,'一期尾矿库');
    addPoint(112.39, 33.9827,'泉水沟尾矿库');
    //自适应
    var coordinatesPolygon = new Array();
    coordinatesPolygon.push([107.523, 23.4087]);
    coordinatesPolygon.push([112.39, 33.9827]);
    coordinatesPolygon.push([110.017,34.2352]);
    var polygon = new ol.geom.Polygon([coordinatesPolygon]);
    polygon.applyTransform(ol.proj.getTransform('EPSG:4326', 'EPSG:3857'));
    map.getView().fit(polygon, map.getSize());


//    map.on('click', function(e){
//        var featureA = map.getFeaturesAtPixel(e.pixel);
//        if ( featureA != null ){
//            alert(featureA[0]);
//            print(featureA[0]);
//        }
//    });




//    let view = map.getView();
//    let extent = view.calculateExtent(map.getSize());

//    var extent=[12665080.52765571, 2550703.6338763316, 12725465.780000998, 2601457.820657688];
//    map.getView().fit(extent, map.getSize());

//    $(function(){
//        $('.marker').on('click', function(){
//            kuname = this.title;
//            $.ajax({
//                url: basepath+'/map/ajaxtest',
//                data:{ kuname: kuname },
//                success: function(result){
//                    $('.modal-body').html(result);
//                }
//            });
//            $('#exampleModal').modal('toggle');
//        });
//    });
//

function loadPointData(points){
    var jsonarray = $.parseJSON(points);
    var coordinatesPolygon = new Array();

    for(var i=0; i<jsonarray.length; i++){
       var pointnow = jsonarray[i];
       var long = pointnow.longitude;
       var lat = pointnow.latitude;
       var name = pointnow.dianName;
       loadMultiPoint(long, lat, name);


      coordinatesPolygon.push([long, lat]);

    }

    var polygon = new ol.geom.Polygon([coordinatesPolygon]);
    polygon.applyTransform(ol.proj.getTransform('EPSG:4326', 'EPSG:3857'));
    map.getView().fit(polygon, map.getSize());

}


$(function(){
    $('.marker').on('click', function(){
        var kuname = this.title;
        var x = map.getOverlays();
        x.clear();
        $.ajax({
            url: basepath+'/map/kuPoints',
            data: { kuname: kuname},
            success: function(points){
                loadPointData(points);
                $('.pointmarker').on('click', function(){

                    $.ajax({
                        url: basepath+'/map/ajaxtest',
                        data:{ kuname: kuname },
                        success: function(result){
                        $('.modal-body').html(result);
                        }
                    });
                    $('#exampleModal').modal('toggle');

                })
            }
        });
    })
})


