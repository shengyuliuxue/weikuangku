from flask import Flask, redirect, url_for, render_template
import pymysql.cursors
from monitoring.map import bp

app = Flask(__name__)

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.register_blueprint(bp)

@app.route('/')
def index():
    return redirect(url_for('/map.map'))


if __name__ == "__main__":
    app.run(debug=True)




