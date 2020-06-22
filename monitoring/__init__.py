from flask import Flask, redirect, url_for, render_template
import pymysql.cursors
from monitoring.map import bp

app = Flask(__name__)
#app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://{DB_USERNAME}:{DB_PASSWORD}@localhost:3306/{DB_NAME}'
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pmysql://root:sy123456@localhost:3306/mydb'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.register_blueprint(bp)




if __name__ == "__main__":
    app.run(debug=True)




