from django.db import models

class MetadataIndex(models.Model):
    namespace = models.CharField(max_length=255, db_index=True)
    docid = models.CharField(max_length=255, db_index=True)
    key = models.CharField(max_length=150)
    value = models.CharField(max_length=255)

    class Meta:
        verbose_name = "Metadata Index"
        verbose_name_plural = "Metadata Index"
        unique_together = (('namespace','docid','key'),)
