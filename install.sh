#!/bin/bash
sudo apt-get install virtualenv python-pip

virtualenv wdb
source wdb/bin/activate

pip install django==1.4.3
pip install south==0.8.1
pip install django-piston==0.2.2.1

python manage.py syncdb
python manage.py migrate
