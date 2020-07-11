var apiPath=jp.getCookie("apiPath");
var map;
//
var isStriograph=false;
//地图点位图相对路径(以/结尾)
var mapIconUrl = "/static/standard/modules/biz/bigscreen/img/icon/";
var heatNav = new Array();
var forwardNav = new Array();
var baseLayers = new Array();
var pointLayers = new Array();
var points = new Array();
var isanimatePoints=false;
var oldSelectedFeature = undefined;
var duration = 3000;
var start = new Date().getTime();
var isAniming = false;
var resourceLayer;
var init=true;
//谷歌卫星地图 混合
 var googleMapLayer = new ol.layer.Tile({
		source: new ol.source.XYZ({
			url: 'http://mt2.google.cn/vt/lyrs=y&hl=zh-CN&gl=CN&src=app&x={x}&y={y}&z={z}&s=G'
		}),
		projection: 'EPSG:3857'
	});

//初始化视图（地图做了自适应，设置初始化视图主要是为了查询没有点位信息时也能显示视图，不然会是一片空白）
var initView={
	 centerX:109.0462,
	 centerY:34.3974,
	 zoom:8
}

function initMap() {
    map = new ol.Map({
        target: 'map',
        // 让双击放大设置为false
        interactions: ol.interaction.defaults({
            doubleClickZoom: false
        }),
        controls: ol.control.defaults({
            attribution: false,
			zoom: false
        })
    });
    map.on('click', function (e) {
		var feature = map.forEachFeatureAtPixel(e.pixel,
			function (feature) {
				return feature;
			});
		if (feature&&feature.get("accessed")==1) {
			var  objectType=feature.get("objectType");
			var objectData={
               	objectType:feature.get("objectType"),
           		objectId:feature.get("objectId"),
				objectName:feature.get("name"),
                subSystemId:feature.get("subSystemId"),
				tailingId:feature.get("tailingId"),
				surveyTypeId:feature.get("surveyTypeId")
			};

			 if(objectType== ManageObjectTypeEnum.Point){
			     openMapObject(objectData);

			 }else{
				 addNav(objectData);
				 load(objectData);
			 }


		}

    });

    var selectPointerMove = new ol.interaction.Select({
        condition: ol.events.condition.pointerMove,
        filter: function (feature,layer) {
            if(layer===resourceLayer)
            {
                return true;
            }
            for (var i = 0; i < pointLayers.length; i++) {
                if (layer === pointLayers[i]) {
                    return true;
                }
            }
            return false;
        }
    });
    map.addInteraction(selectPointerMove);
    selectPointerMove.on('select', function (e) {
        if (oldSelectedFeature) {
            var style = oldSelectedFeature.getStyle();
            style.getImage().setScale(1);
            style.getText().setScale(1);
            oldSelectedFeature.setStyle(style);
            oldSelectedFeature = undefined;
        }
        var features = e.target.getFeatures();
        if (features.getLength() > 0) {
            var objectType = features.item(0).get("objectType");
            if (objectType) {
                oldSelectedFeature = features.item(0);
                var style = oldSelectedFeature.getStyle();
                style.getImage().setScale(2);
                style.getText().setScale(2);
                oldSelectedFeature.setStyle(style);
            }
        }
    });


	//map.on('postcompose', animate);
	//window.setInterval(animatePoints, 1000);

	if(isanimatePoints==false)
	{
		 isanimatePoints=true;
		 map.on('postcompose', animate);
		 window.setInterval(animatePoints, 1000*2);

	}
	map.addLayer(googleMapLayer);
}


 function addNav(objectData) {
	 var tem=heatNav[heatNav.length-1];
	 if(!tem||(objectData&&objectData.objectId!=tem.objectId&&objectData.objectType!=tem.objectType)){
		 heatNav.push(objectData);
		 forwardNav = new Array();
	 }
}



function loadMap(objectData){
	if(!objectData){
		return;
	}
    isStriograph=false;
	var objectType=objectData.objectType;
	$("#mapTitle").html(objectData.objectName?objectData.objectName:"实时地图");
	if(objectType == ManageObjectTypeEnum.All||objectType ==ManageObjectTypeEnum.Organize||objectType ==ManageObjectTypeEnum.OrganizeCompany){
		clearLayers();
		setView(initView);
		showMainLayer(true);
		loadMapPoints(objectData);
	}else {
        loadMapLayer(objectData);
	}
};

function loadMapLayer(objectData) {
	if(!objectData||!objectData.subSystemId||!objectData.objectType||!objectData.objectId){
		return;
	}
    $.ajax({
        type: "post",
        dataType: "json",
        url: apiPath+"/omsmap/listMapLayer",
        data: {
        	subSystemId: objectData.subSystemId,
			 objectType: objectData.objectType,
			   objectId: objectData.objectId
		},
        success: function (result) {
            clearLayers();
            showMainLayer(false);
            if(result &&result.code=="200"){
                var data=result.data;
                setView(data[0]);
                if(data[0].layerId){
                    addLayers(data);
                }else{
                    showMainLayer(true);
                }
            }else{
                setView(initView);
                showMainLayer(true);
            }
            loadMapPoints(objectData);
        }
    });

}

function loadMapPoints(objectData){
	 $.ajax({
            url: apiPath+"/omsmap/listMapPoint",
		    type: "post",
         	dataType: "json",
            data: {
				objectType: objectData.objectType,
				  objectId: objectData.objectId,
                subSystemId: objectData.subSystemId,
				     level: objectData.level,
			 projectInfoId: objectData.projectInfoId,
           projectInfoName: objectData.projectInfoName,
					 grade: objectData.grade,
			          warn: objectData.warn,
			    joinStatus: objectData.joinStatus
			},

            success: function (result) {
				if(!isEmpty(result)&&result.code=="200"){
					addPointLayer(result.data);
				}
            }
        });
}

function addPointLayer(pointList){
	var pointLayer = new ol.layer.Vector({ source: new ol.source.Vector() });
	pointLayers.push(pointLayer);
	map.addLayer(pointLayer);
	addPoints(pointLayer,pointList);
}

function addPoints(pointLayer,pointList){
	var coordinatesPolygon = new Array();

	for (var i = 0; i < pointList.length; i++) {
		var mapPoint=pointList[i];

		var x=mapPoint.longitude;
		var y=mapPoint.latitude;
		if(isStriograph){
            x=mapPoint.x;
            y=mapPoint.y;
		}
		if (x &&y) {
			coordinatesPolygon.push([x,y]);
			var point = new ol.Feature({
				geometry: new ol.geom.Point([x,y])
			});
			var text = mapPoint.objectName + (mapPoint.surveyTypeId == SurveyType.UnMine ? " " + mapPoint.des : "");
			point.set("objectId", mapPoint.objectId);
			point.set("name", mapPoint.objectName);
			point.set("subSystemId", mapPoint.subSystemId);
			point.set("tailingId", mapPoint.tailingId);
			point.set("objectType", mapPoint.objectType);
			point.set("warn", mapPoint.warn);
			point.set("fault", mapPoint.fault);
			point.set("accessed", mapPoint.accessed);
			point.set("surveyTypeId", mapPoint.surveyTypeId);
			point.setStyle(new ol.style.Style({
				image: new ol.style.Icon({
					anchor: [0.5, 0.5],
					src: mapIconUrl+mapPoint.icon
				}),
				text: new ol.style.Text({
					font: '16px',
					text: text,
					fill: new ol.style.Fill({ color: '#fff' }),
					stroke: new ol.style.Stroke({ color: '#2c3e50', width: 4 }),
					offsetX: 0,
					offsetY: 16
				})
			}));
			pointLayer.getSource().addFeature(point);
			if (mapPoint.warn > 0) {
				points.push(point);
			}
		}

	}
	//地图自适应
	if(coordinatesPolygon.length>1){
		var plygon = new ol.geom.Polygon([coordinatesPolygon])
		map.getView().fit(plygon,map.getSize());
	}else if(coordinatesPolygon.length==1){
		setMapCenter(coordinatesPolygon[0]);
	}
}

function addLayers(data) {
    isStriograph=true;
	 for (var i = 0; i < data.length; i++) {
		if(data[i].outterUrl){
			var tiled = new ol.layer.Tile({
			source: new ol.source.TileWMS({
				url: data[i].outterUrl,
				params: {
					tiled: true,
					LAYERS: data[i].name
					}
				})
			});
			baseLayers.push(tiled);
			map.addLayer(tiled);
		}

	}
};

function setView(data){
	if(data&&data.centerX&&data.centerY){
		var view = new ol.View({
		center: [data.centerX, data.centerY],
		zoom: data.zoom,
		projection: new ol.proj.Projection({
			code: data.projection==null?'EPSG:4326':data.projection,
			units: data.projection==null || data.projection =='EPSG:4326' ?'degrees':'m',
			axisOrientation: data.axisOrientation ==null ?'':data.axisOrientation

		})
	})
		map.setView(view);
	 }
};

function showMainLayer(isMain){
	googleMapLayer.setVisible(isMain);
}



function clearBaseLayers() {
    for (var i = 0; i < baseLayers.length; i++) {
        baseLayers[i].setVisible(false);
    }
};
function clearPointLayers() {
    for (var i = 0; i < pointLayers.length; i++) {
        pointLayers[i].setVisible(false);
    }
	points = new Array();
}

function clearLayers(){
	clearPointLayers();
	clearBaseLayers();
}



 //地图居中
function setMapCenter(center) {
    //设置初始地图的中心坐标
    map.getView().setCenter(center);
};


function animate(event) {
    if (points.length > 0) {
        var vectorContext = event.vectorContext;
        var frameState = event.frameState;
        var elapsed = frameState.time- start-5000;
	 	elapsed=Math.abs(elapsed);
        var elapsedRatio = elapsed / duration;
        var radius = ol.easing.easeOut(elapsedRatio) * 4+ 5;
        var opacity = ol.easing.easeOut(1 - elapsedRatio);//

        for (var i = 0; i < points.length; i++) {
            var feature = points[i];
            var flashGeom = feature.getGeometry().clone();

            var warn = feature.get("warn");
            var isFault = feature.get("isFault");
            var color = 'rgba(32,145,0, ' + opacity + ')';
            if (warn > 0) {
                color = 'rgba(255,100,0, ' + opacity + ')';
            }
            else if(isFault > 0) {
                    color = 'rgba(250,43,72, ' + opacity + ')';
            }
            var style = new ol.style.Style({
                image: new ol.style.Circle({
                    radius: radius,
                    snapToPixel: false,
                    stroke: new ol.style.Stroke({
                        color: color,
                        width: radius - 4
                    })
                })
            });

            vectorContext.setStyle(style);
			vectorContext.drawGeometry(flashGeom);

        }

 			if (elapsed> duration) {
				start = new Date().getTime();
				isAniming = false;
				return;
			}
        isAniming = true;
        map.render();
    }
    else {
        isAniming = false;
    }
}

function animatePoints() {
    if (!isAniming&&points.length > 0) {
        map.render();
    }
}

//放大
function zoomOut() {
    var zm = map.getView().getZoom() + 1;
    if (zm <19)
        map.getView().setZoom(zm);
}

//缩小
function zoomIn() {
    var zm =map.getView().getZoom() - 1;
    if (zm > 6)
        map.getView().setZoom(zm);
}


function showHeatView(){
	if(heatNav.length>1){
		var itemForward =	heatNav.splice(heatNav.length - 1, 1);
		forwardNav.push(itemForward[0]);
		var item = heatNav[heatNav.length - 1];
        load(item);
	}
}
function showForwardView(){
	if(forwardNav.length>0){
		var item =forwardNav.splice(forwardNav.length - 1, 1);
		heatNav.push(item[0]);
		load(item[0]);
	}
}

//函数未用，暂时保留
function loadtailing(row){
	clearBaseLayers();
	clearPointLayers();
	showMainLayer(true);
	var mapPoint=new Object();
	mapPoint.x=row.lng;
	mapPoint.y=row.lat;
	mapPoint.objectId=row.tailingId;
	mapPoint.objectName=row.tailingName;
	mapPoint.companyId=row.companyId;
	mapPoint.objectType=ManageObjectTypeEnum.Tailing;
	mapPoint.warn=row.maxWarnGrade;
	mapPoint.fault=row.faultNum;
	mapPoint.accessed=1;
	mapPoint.icon=mapIconUrl+"color-dot-green.png";
	if(row.maxWarnGrade!=0){
		mapPoint.icon=mapIconUrl+"color-dot-orange.png";
	}else if(row.faultNum !=0){
		mapPoint.icon=mapIconUrl+"color-dot-orange-white.png";
	}
	setView(mapPoint);
	var mapPointList = new Array();
	mapPointList.push(mapPoint);
	addPointLayer(mapPointList);

}

