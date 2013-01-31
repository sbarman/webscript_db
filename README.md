webscript_db
============

A web-interface and database backend for 'webscript'.

Quick Setup
-----------------

Django 1.4.3: pip install django==1.4.3
South: pip install south
Piston: pip install -e hg+https://bitbucket.org/jespern/django-piston/@7c90898072ce9462a6023bbec5d408ad097a362b#egg=django-piston
Piston: pip install django-piston==0.2.2

Add this directory to the PYTHONPATH so django can find the
webscript_backend django app.

  cd webscriptdb/
  python manage.py syncdb    # First time only to create DB
  python manage.py runserver 
  
Useful starting URLs:
 * http://localhost:8000/admin/
 * http://localhost:8000/api/
   * http://localhost:8000/api/(script|event|parameter|replay)/
     * * http://localhost:8000/api/(script|event|parameter|replay)/1/
