webscript_db
============

A web-interface and database backend for 'webscript'.

Quick Setup
-----------------

Django 1.3.3: pip install django==1.3.3
Tastypie: pip install django-tastypie
Piston: pip install -e hg+https://bitbucket.org/jespern/django-piston/@7c90898072ce9462a6023bbec5d408ad097a362b#egg=django-piston

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
