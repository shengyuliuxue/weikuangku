import pymysql.cursors

connection = pymysql.connect(host='localhost',
                            user='root',
                             password='sy123456',
                             db='mydb',
                             charset='utf8',
                             cursorclass=pymysql.cursors.DictCursor)

try:
    with connection.cursor() as cursor:
        sql = "SELECT * FROM kudata"
        cursor.execute(sql)
        result = cursor.fetchall()
        print(result)
finally:
    connection.close()

