from flask import Blueprint, render_template

bp = Blueprint('/map', __name__, url_prefix='/map')

@bp.route('/',methods=('GET', 'POST'))
def map():
    return render_template('base.html')