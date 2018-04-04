from flask import *
from flask_cors import CORS, cross_origin
import os
import pandas as pd

app = Flask(__name__)
app.config['ROOT'] = os.getcwd()
cors = CORS(app, resources={r"/api/*": {"origins": "*"}})

@app.route("/", methods=['GET'])
def workspace():
    return render_template("workspace/workspace.html")

@app.route("/modals/<path:filename>")
def get_modal(filename):
    return send_file(app.config['ROOT'] + "/modals/" + filename)

@app.route("/available/files", methods=['GET'])
def available_files():
    files = ["bank-marketing.csv", "winequality-red.csv", "winequality-white.csv"]
    return jsonify(files)

@app.route("/files/shape/<file>")
def file_shape(file=None):
    df = pd.read_csv("data/" + file, delimiter=";")
    return jsonify(df.dtypes.apply(lambda x: x.name).to_dict())

if __name__ == '__main__':
    app.run(debug=True)