import flask
import dash
import dash_html_components as html
import dash_core_components as dcc
import dash_table
import requests
import json
import statsmodels.stats.api as sms
import pandas as pd

from flask import Flask, request, redirect, session
from dash.dependencies import Input, Output
import plotly.express as px


server = flask.Flask(__name__)

app = dash.Dash(
    __name__,
    server=server,
    routes_pathname_prefix='/dash/'
)

app.layout = html.Div([
    dcc.Graph(id='histogram'),
    html.Button('Update', id='update-button'),
    html.Div("My Dash app")
    ]
)

def compute_ci(data):
    json_data = json.loads(data.text)
    obs_list = list(json_data)
    df = pd.DataFrame({"observatoin": obs_list})
    print(sms.DescrStatsW(df).tconfint_mean())
    return df

@server.route('/')
def index():
    return 'Hello Flask app'

@app.callback(Output(component_id="histogram", component_property="figure"), [Input('update-button', 'n_clicks')])
@server.route("/data")
def get_date():
    lonic_code = requests.args.get('lonicCode')
    query = "fhir/obsevation?lonicCode=" + lonic_code
    data = requests.get('http://localhost:8080/' + query)
    df = compute_ci(data)
    fig = px.histogram(df, x = "observatoin")
    fig.show()
    return fig.show()

if __name__ == '__main__':
    app.run_server(debug=True)