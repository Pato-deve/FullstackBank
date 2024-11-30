from django.http import HttpResponse

def home(request):
    return HttpResponse("Welcome to the Fullstack Bank API!")  # Basic message, or render a template
