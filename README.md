webscript_db
============

A web-interface and database backend for 'webscript'.

Quick Setup
-----------------

Install the following python packages. We recommend using virtualenv so
the specific versions won't clash with your current system.

* Django 1.4.3: pip install django==1.4.3
* South: pip install south
* Piston: pip install django-piston==0.2.2
  * note that piston 0.2.3 has a bug that prevents the custom fields of a many-2-many filed from being used

Add this project directory to the PYTHONPATH so django can find the
webscript_backend django app.

The project is currently set up to use a sqlite database. This will work
if you are simply testing out the tool, but we recommend upgrading to
another database for a full installation. Once everything is configured,
create and sync the database using the following commands, and start the server
by running the last line.

    cd webscriptdb/
    python manage.py syncdb    # First time only to create DB
    python manage.py migrate webscript_backend
    
    python manage.py runserver 
  
The followings links may be useful:
* http://localhost:8000/admin/
* http://localhost:8000/api/
  * http://localhost:8000/api/(script|event|parameter|replay)/
  * http://localhost:8000/api/(script|event|parameter|replay)/1/
