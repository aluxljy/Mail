# Mail--A single page app
A project from https://cs50.harvard.edu/web/2020/projects/3/mail/

Please ensure that Python is installed to run this code

Steps to run the code:
1. Download the ZIP file and open the folder in your desired IDE, preferable VS Code.

2. Create a virtual environment using the command ```py -3 -m venv .venv``` for Windows.
(*Make sure you are in the correct working directory which is the folder created at Step 1)

3. Activate the virtual environment using the command ```.venv\scripts\activate```.
(*Make sure you are currently in the correct working directory which is the folder created at Step 1)

4. Update pip in the virtual environment using the command ```python -m pip install --upgrade pip```.

5. Install Django in the virtual environment using the command ```python -m pip install django```.

6. Run the command ```python manage.py makemigrations mail``` to make migrations for the mail app.

7. Run the command ```python manage.py migrate``` to apply migrations to your database.

8. After making and applying migrations for the project, run ```python manage.py runserver``` to start the web server.

9. Open the web server in your browser, and use the “Register” link to register for a new account. The emails you’ll be sending and receiving in this project will be entirely stored in your database (they won’t actually be sent to real email servers), so you’re welcome to choose any email address (e.g. foo@example.com) and password you’d like for this project: credentials need not be valid credentials for actual email addresses.
