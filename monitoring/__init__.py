from flask import Flask
import pymysql.cursors
from monitoring.map import bp

app = Flask(__name__)
#app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://{DB_USERNAME}:{DB_PASSWORD}@localhost:3306/{DB_NAME}'
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pmysql://root:sy123456@localhost:3306/mydb'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS']=False
app.register_blueprint(bp)


@app.route('/')
def hello():

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
            print(result[0])

    finally:
        connection.close()

    return "hello world"

if __name__ == "__main__":
    app.run(debug=True)




