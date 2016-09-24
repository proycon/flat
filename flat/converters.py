import json
import importlib
from django.conf import settings

class Converter:
    def __init__(self, module, function, name, parameter_help="", parameter_default="", inputextensions=None):
        self.module = module
        self.function = function
        self.name = name
        self.parameter_help = parameter_help
        self.parameter_default = parameter_default
        if isinstance(inputextensions,str):
            self.inputextensions = [self.inputextensions]
        elif self.inputextensions:
            self.inputextensions = self.inputextensions
        else:
            self.inputextensions = []

    def get_output_name(self, inputfilename):
        for inputextension in self.inputextensions:
            if inputextension[0] == '.': inputextension = inputextension[1:]
            if inputfilename.lower().endswith('.' + inputextension.lower()):
                return inputfilename[:-len(inputextension)] + 'folia.xml'
        return inputfilename + '.folia.xml' #default, just append


    def parse_parameters(self, request, parameterfield, method='POST'):
        parameters =  json.loads('{' + getattr(request,method)['parameterfield'] + '}')
        parameters['flatuser'] = request.user.username
        parameters['flatconfiguration'] =  settings.CONFIGURATIONS[request.session['configuration']]
        return parameters

    def convert(self, inputfilename, outputfilename, *args, **kwargs):
        try:
            module = importlib.import_module(self.module)
        except ImportError:
            return (False, "Module " + self.module + " could not be imported")
        try:
            convertfunction = getattr(module, self.function)
        except AttributeError:
            return (False, "Function " + self.function + " was not found in module " + self.module)
        response  = convertfunction(inputfilename, outputfilename, *args, **kwargs)
        if response is False:
            return (False, "Converter returned with an unspecified error")
        elif response is True:
            return True, "Conversion successful"
        elif len(response) == 2:
            return response
        else:
            return (False, "Converter did not return a compatible response, but be (bool succes, str errormessage)")


def get_converters(request):
    if 'converters' in settings.CONFIGURATIONS[request.session['configuration']]:
        for converter in settings.CONFIGURATIONS[request.session['configuration']]['converters']:
            yield Converter(converter['module'], converter['function'], converter['name'], converter['parameter_help'] if 'parameter_help' in converter else "", converter['parameter_default'] if 'parameter_default' in converter else "", converter['inputextensions'] if 'inputextensions' in converter else [])
