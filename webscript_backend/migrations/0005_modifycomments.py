# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Deleting field 'Comment.replay_event'
        db.delete_column('webscript_backend_comment', 'replay_event_id')

        # Deleting field 'Comment.event'
        db.delete_column('webscript_backend_comment', 'event_id')

        # Adding field 'Comment.script'
        db.add_column('webscript_backend_comment', 'script',
                      self.gf('django.db.models.fields.related.ForeignKey')(default=None, related_name='comments', null=True, blank=True, to=orm['webscript_backend.Script']),
                      keep_default=False)

        # Adding field 'Comment.replay'
        db.add_column('webscript_backend_comment', 'replay',
                      self.gf('django.db.models.fields.related.ForeignKey')(default=None, related_name='comments', null=True, blank=True, to=orm['webscript_backend.Replay']),
                      keep_default=False)

        # Adding field 'Comment.execution_order'
        db.add_column('webscript_backend_comment', 'execution_order',
                      self.gf('django.db.models.fields.FloatField')(default=0),
                      keep_default=False)


    def backwards(self, orm):
        # Adding field 'Comment.replay_event'
        db.add_column('webscript_backend_comment', 'replay_event',
                      self.gf('django.db.models.fields.related.ForeignKey')(default=None, related_name='comments', null=True, to=orm['webscript_backend.ReplayEvent'], blank=True),
                      keep_default=False)

        # Adding field 'Comment.event'
        db.add_column('webscript_backend_comment', 'event',
                      self.gf('django.db.models.fields.related.ForeignKey')(default=None, related_name='comments', null=True, to=orm['webscript_backend.Event'], blank=True),
                      keep_default=False)

        # Deleting field 'Comment.script'
        db.delete_column('webscript_backend_comment', 'script_id')

        # Deleting field 'Comment.replay'
        db.delete_column('webscript_backend_comment', 'replay_id')

        # Deleting field 'Comment.execution_order'
        db.delete_column('webscript_backend_comment', 'execution_order')


    models = {
        'auth.group': {
            'Meta': {'object_name': 'Group'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '80'}),
            'permissions': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['auth.Permission']", 'symmetrical': 'False', 'blank': 'True'})
        },
        'auth.permission': {
            'Meta': {'ordering': "('content_type__app_label', 'content_type__model', 'codename')", 'unique_together': "(('content_type', 'codename'),)", 'object_name': 'Permission'},
            'codename': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'content_type': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['contenttypes.ContentType']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '50'})
        },
        'auth.user': {
            'Meta': {'object_name': 'User'},
            'date_joined': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now'}),
            'email': ('django.db.models.fields.EmailField', [], {'max_length': '75', 'blank': 'True'}),
            'first_name': ('django.db.models.fields.CharField', [], {'max_length': '30', 'blank': 'True'}),
            'groups': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['auth.Group']", 'symmetrical': 'False', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_active': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'is_staff': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'is_superuser': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'last_login': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now'}),
            'last_name': ('django.db.models.fields.CharField', [], {'max_length': '30', 'blank': 'True'}),
            'password': ('django.db.models.fields.CharField', [], {'max_length': '128'}),
            'user_permissions': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['auth.Permission']", 'symmetrical': 'False', 'blank': 'True'}),
            'username': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '30'})
        },
        'contenttypes.contenttype': {
            'Meta': {'ordering': "('name',)", 'unique_together': "(('app_label', 'model'),)", 'object_name': 'ContentType', 'db_table': "'django_content_type'"},
            'app_label': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'model': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100'})
        },
        'webscript_backend.comment': {
            'Meta': {'object_name': 'Comment'},
            'creation_date': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'execution_order': ('django.db.models.fields.FloatField', [], {}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'modification_date': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'auto_now_add': 'True', 'blank': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '32'}),
            'replay': ('django.db.models.fields.related.ForeignKey', [], {'default': 'None', 'related_name': "'comments'", 'null': 'True', 'blank': 'True', 'to': "orm['webscript_backend.Replay']"}),
            'script': ('django.db.models.fields.related.ForeignKey', [], {'default': 'None', 'related_name': "'comments'", 'null': 'True', 'blank': 'True', 'to': "orm['webscript_backend.Script']"}),
            'value': ('django.db.models.fields.TextField', [], {})
        },
        'webscript_backend.event': {
            'Meta': {'ordering': "['creation_date']", 'object_name': 'Event'},
            'creation_date': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'dom_post_event_state': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'dom_pre_event_state': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'event_type': ('django.db.models.fields.CharField', [], {'max_length': '128'}),
            'execution_order': ('django.db.models.fields.FloatField', [], {}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'modification_date': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'auto_now_add': 'True', 'blank': 'True'}),
            'script': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'events'", 'to': "orm['webscript_backend.Script']"}),
            'version': ('django.db.models.fields.CharField', [], {'default': "'1.0'", 'max_length': '32'})
        },
        'webscript_backend.parameter': {
            'Meta': {'object_name': 'Parameter'},
            'creation_date': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'data_type': ('django.db.models.fields.CharField', [], {'max_length': '32'}),
            'event': ('django.db.models.fields.related.ForeignKey', [], {'default': 'None', 'related_name': "'parameters'", 'null': 'True', 'blank': 'True', 'to': "orm['webscript_backend.Event']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'modification_date': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'auto_now_add': 'True', 'blank': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '64'}),
            'replay_event': ('django.db.models.fields.related.ForeignKey', [], {'default': 'None', 'related_name': "'parameters'", 'null': 'True', 'blank': 'True', 'to': "orm['webscript_backend.ReplayEvent']"}),
            'value': ('django.db.models.fields.TextField', [], {})
        },
        'webscript_backend.replay': {
            'Meta': {'object_name': 'Replay'},
            'creation_date': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'modification_date': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'auto_now_add': 'True', 'blank': 'True'}),
            'script': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['webscript_backend.Script']"})
        },
        'webscript_backend.replayevent': {
            'Meta': {'object_name': 'ReplayEvent'},
            'creation_date': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'dom_post_event_state': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'dom_pre_event_state': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'event': ('django.db.models.fields.related.ForeignKey', [], {'default': 'None', 'to': "orm['webscript_backend.Event']", 'null': 'True', 'blank': 'True'}),
            'event_type': ('django.db.models.fields.CharField', [], {'max_length': '128'}),
            'execution_order': ('django.db.models.fields.FloatField', [], {}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'modification_date': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'auto_now_add': 'True', 'blank': 'True'}),
            'replay': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['webscript_backend.Replay']"}),
            'version': ('django.db.models.fields.CharField', [], {'default': "'1.0'", 'max_length': '32'})
        },
        'webscript_backend.script': {
            'Meta': {'ordering': "['creation_date']", 'object_name': 'Script'},
            'creation_date': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'description': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'modification_date': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'auto_now_add': 'True', 'blank': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '128'}),
            'notes': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['auth.User']"})
        }
    }

    complete_apps = ['webscript_backend']