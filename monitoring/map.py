from flask import Blueprint, render_template, request
import pymysql.cursors

bp = Blueprint('/map', __name__, url_prefix='/map')

def dataConnect(query):
    connection = pymysql.connect(host='localhost',
                                 user='root',
                                 password='sy123456',
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
    print(result)

    return render_template('kudata.html', kudata=result)

@bp.route('/status', methods=('GET', 'POST'))
def status():
    query = 'select * from kudata'
    result = dataConnect(query)
    return render_template('rightBottom.html', data=result)
