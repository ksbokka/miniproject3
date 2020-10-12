from setuptools import setup

setup(
    name='hello-world-cli',
    py_modules=['helloworld'],
    install_requires=[
        'json',
        "requests",
        "flask",
        "dash",
        "plotly",
        "statsmodels",
        "pandas",
        "requests",
    ],
    entry_points='''
        [console_scripts]
        hello=helloworld:hello
    ''',
)