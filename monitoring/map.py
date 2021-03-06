# -*- coding:utf-8 -*-
from flask import Blueprint, render_template, request
import pymysql.cursors
import json
import datetime


class DateEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime.datetime):
            return obj.strftime('%Y-%m-%d %H:%M:%S')
        elif isinstance(obj, date):
            return obj.strftime("%Y-%m-%d")
        else:
            return json.JSONEncoder.default(self, obj)

bp = Blueprint('/map', __name__, url_prefix='/map')

def dataConnect(query):
    connection = pymysql.connect(host='localhost',
                                 user='root',
                                 password='shengyu1987',
                                 db='mydb',
                                 charset='utf8',
                                 cursorclass=pymysql.cursors.DictCursor)

    try:
        with connection.cursor() as cursor:
            #sql = "SELECT * FROM kudata"
            cursor.execute(query)
            result = cursor.fetchall()
            #print(result)
            return result
    finally:
        connection.close()


@bp.route('/', methods=('GET', 'POST'))
def map():
    query = "select * from kudata"
    data = dataConnect(query)
    #longtitude = data[0]['longtitude']
    #latitude = data[0]['latitude']
    return render_template('basetest.html', data=data)
    #return render_template('echart_test.html')

@bp.route('/ajaxtest', methods=('GET', 'POST'))
def ajaxtest():
    kuname = request.args.get('kuname')
    query = 'select * from diandata where kuId=1'
    #print (query)
    result = dataConnect(query)
    query2 = 'select * from waterdata where CdianId=11'
    result2 = dataConnect(query2)

    return render_template('kudata.html', kudata=result, waterdata=result2)

@bp.route('/status', methods=('GET', 'POST'))
def status():
    query = 'select * from kudata'
    result = dataConnect(query)
    return render_template('rightBottom.html', data=result)

@bp.route('/kuPoints', methods=('GET', 'POST'))
def kuPoints():
    kuname = request.args.get('kuname')
    query = 'select * from diandata where latitude is not null and longitude is not null'
    resultlist = dataConnect(query)
    jsondata = json.dumps(resultlist, ensure_ascii=False)
    return jsondata

@bp.route('/waterdata', methods=('GET', 'POST'))
def waterdata():
    query = 'select * from waterdata'
    resultlist = dataConnect(query)
    waterjson = json.dumps(resultlist, ensure_ascii=False, cls=DateEncoder)
    return  waterjson