from flask import Flask, render_template,request, request
import plotly
import plotly.graph_objs as go

import pandas as pd
import numpy as np
import json

import requests

app = Flask(__name__)


@app.route('/')
def index():
    feature = 'Bar'
    bar = create_plot(feature)
    return render_template('index.html', plot=bar)

def create_plot(feature):
    if feature == 'Bar':
        N = 40
        x = np.linspace(0, 1, N)
        y = np.random.randn(N)
        df = pd.DataFrame({'x': x, 'y': y}) # creating a sample dataframe
        data = [
            go.Bar(
                x=df['x'], # assign x as the dataframe column 'x'
                y=df['y']
            )
        ]
    else:
        N = 1000
        random_x = np.random.randn(N)
        random_y = np.random.randn(N)

        # Create a trace
        data = [go.Scatter(
            x = random_x,
            y = random_y,
            mode = 'markers'
        )]


    graphJSON = json.dumps(data, cls=plotly.utils.PlotlyJSONEncoder)

    return graphJSON
def compute_ci(data):
    json_data = json.loads(data.text)
    obs_list = list(json_data)
    df = pd.DataFrame({"observatoin": obs_list})
    print(sms.DescrStatsW(df).tconfint_mean())
    return df

@app.route('/data', methods=['GET', 'POST'])
def change_features():
    # lonic_code = request.args.get('lonicCode')
    lonic_code = "72514-3"
    query = "fhir/obsevation?lonicCode=" + lonic_code
    data = requests.get('http://localhost:8080/' + query)
    df = compute_ci(data)
    fig = go.Figure(data = [go.Histogram(x = df["observation"])])
    graphJSON = json.dumps(data, cls=plotly.utils.PlotlyJSONEncoder)
    # feature = request.args['selected']
    # graphJSON= create_plot(feature)
    return graphJSON

if __name__ == '__main__':
    app.run()