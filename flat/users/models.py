from django.db import models
from django.contrib.auth.models import User, Group
from django.core.exceptions import ObjectDoesNotExist

class ReadPermissions(models.Model):
    username = models.CharField(max_length=50)
    namespace = models.CharField(max_length=50)

    def __unicode__(self):
        return self.username + " may read " + self.namespace

    def __str__(self):
        return self.username + " may read " + self.namespace

    class Meta:
        verbose_name = "Legacy read permission"
        verbose_name_plural = "Legacy read permissions"

class WritePermissions(models.Model):
    username = models.CharField(max_length=50)
    namespace = models.CharField(max_length=50)

    def __unicode__(self):
        return self.username + " may write to " + self.namespace

    def __str__(self):
        return self.username + " may write to  " + self.namespace

    class Meta:
        verbose_name = "Legacy write permission"
        verbose_name_plural = "Legacy write permissions"


def hasreadpermission(username, namespace, request):
    if username == namespace or namespace == "testflat":
        return True
    elif request.user.is_superuser:
        return True
    else:
        #new group-based system
        try:
            #is the namespace a group namespace?
            groupnamespace = Group.objects.get(name=namespace.split('/')[0])
            #are we a member of it?
            if request.user.groups.filter(name=groupnamespace.name).exists():
                return True
        except ObjectDoesNotExist:
            groupread = request.user.has_perm('auth.groupread')
            if groupread:
                try:
                    #is the namespace a user namespace?
                    usernamespace = User.objects.get(username=namespace.split('/')[0])
                    #user's namespace must share a group with us
                    if usernamespace.groups.filter(name__in=(g.name for g in request.user.groups.all())).exists():
                        return True
                except ObjectDoesNotExist:
                    pass

        #old system
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

def haswritepermission(username, namespace, request):
    if username == namespace or namespace == "testflat":
        return True
    elif request.user.is_superuser:
        return True
    else:
        #new group-based system
        try:
            #is the namespace a group namespace?
            groupnamespace = Group.objects.get(name=namespace.split('/')[0])
            #are we a member of it?
            if request.user.groups.filter(name=groupnamespace.name).exists():
                return True
        except ObjectDoesNotExist:
            groupwrite = request.user.has_perm('auth.groupwrite')
            if groupwrite:
                try:
                    #is the namespace a user namespace?
                    usernamespace = User.objects.get(username=namespace.split('/')[0])
                    #user's namespace must share a group with us
                    if usernamespace.groups.filter(name__in=(g.name for g in request.user.groups.all())).exists():
                        return True
                except ObjectDoesNotExist:
                    pass

        #old system
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
