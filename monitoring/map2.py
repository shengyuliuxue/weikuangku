from flask import Blueprint, render_template
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
            print(result)
            return result
    finally:
        connection.close()


@bp.route('/', methods=('GET', 'POST'))
def map():
    query = "select * from kudata"
    data = dataConnect(query)
    longtitude = data[0]['longtitude']
    latitude = data[0]['latitude']
    return render_template('modal.html')
