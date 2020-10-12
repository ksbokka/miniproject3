# set base image (host OS)
FROM python:3.7

# set the working directory in the container
WORKDIR /code

# copy the dependencies file to the working directory
COPY requirments.txt .

# install dependencies
RUN pip3 install -r requirments.txt

# copy the content of the local src directory to the working directory
COPY dash_app.py/ .

# command to run on container start
CMD [ "python3", "dash_app.py" ]