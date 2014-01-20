from django.shortcuts import render, redirect
import django.contrib.auth

def login(request):
    if not request.user.is_authenticated():
        return render(request, 'login.html')
    else:
        username = request.POST['username']
        password = request.POST['password']
        user = django.contrib.auth.authenticate(username=username, password=password)
        if user is not None:
            if user.is_active:
                django.contrib.auth.login(request, user)
                # Redirect to a success page.
                if 'next' in request.POST:
                    redirect("/" + request.POST['next'])
                elif 'next' in request.GET:
                    redirect("/" + request.GET['next'])
                else:
                    redirect("/")
            else:
                # Return a 'disabled account' error message
                return render(request, 'login.html')
        else:
            # Return an 'invalid login' error message.
            return render(request, 'login.html')

def logout(request):
    django.contrib.auth.logout(request)
    redirect("/login")
