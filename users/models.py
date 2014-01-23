from django.db import models

class ReadPermissions(models.Model):
    username = models.CharField(max_length=50)
    namespace = models.CharField(max_length=50)

class WritePermissions(models.Model):
    username = models.CharField(max_length=50)
    namespace = models.CharField(max_length=50)

def hasreadpermission(username, namespace):
    if username == namespace:
        return True
    else:
        try:
            perms = ReadPermissions.objects.get(username=username, namespace=namespace)
        except:
            return False
        return len(perms) >= 1

def haswritepermission(username, namespace):
    if username == namespace:
        return True
    else:
        try:
            perms = WritePermissions.objects.get(username=username, namespace=namespace)
        except:
            return False
        return len(perms) >= 1
