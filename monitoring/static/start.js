

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

    addPoint(107.523, 23.4087,'一期尾矿库');
    addPoint(112.39, 33.9827,'泉水沟尾矿库');

    $(function(){
        $('.marker').on('click', function(){
            kuname = this.title;
            $.ajax({
                url: "{{ url_for('/map.ajaxtest') }}",
                data:{ kuname: kuname },
                success: function(result){
                    $('.modal-body').html(result);
                }
            });
            $('#exampleModal').modal('toggle');
        });
    });

