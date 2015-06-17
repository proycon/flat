from django.db import models

class ReadPermissions(models.Model):
    username = models.CharField(max_length=50)
    namespace = models.CharField(max_length=50)

    def __unicode__(self):
        return self.username + " may read " + self.namespace

class WritePermissions(models.Model):
    username = models.CharField(max_length=50)
    namespace = models.CharField(max_length=50)

    def __unicode__(self):
        return self.username + " may write to " + self.namespace

def hasreadpermission(username, namespace):
    if username == namespace or namespace == "testflat":
        return True
    else:
        try:
            perms = ReadPermissions.objects.get(username=username, namespace='ALL')
        except:
            nsparts = namespace.split('/')
            namespace = ""
            for i, nspart in enumerate(nsparts):
                if i == 0 and nspart == username: 
                    return True
                namespace = (namespace + '/' + nspart).strip('/')
                try:
                    perms = ReadPermissions.objects.get(username=username, namespace=namespace)
                    return True
                except:
                    pass
        return False

def haswritepermission(username, namespace):
    if username == namespace or namespace == "testflat":
        return True
    else:
        try:
            perms = WritePermissions.objects.get(username=username, namespace='ALL')
        except:
            nsparts = namespace.split('/')
            namespace = ""
            for i, nspart in enumerate(nsparts):
                if i == 0 and nspart == username: 
                    return True
                namespace = (namespace + '/' + nspart).strip('/')
                try:
                    perms = WritePermissions.objects.get(username=username, namespace=namespace)
                    return True
                except:
                    pass
        return False
