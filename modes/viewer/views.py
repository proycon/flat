# Create your views here.
import flat.comm as comm
import flat.settings as settings

def view(request, docid):
    data = comm.get(request, '/getdoc/%NS%/' + docid + '/')

    pass


