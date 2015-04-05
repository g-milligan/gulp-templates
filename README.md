# This a GULP project generator

This is an implementation for deploying gulp project templates. As I create more templates, I will heap them into this repo.

I have a shell script called "gulpinit". Running gulpinit will allow me to select which project template to build.
The "gulpinit" shell script copies template folders into a new project and also lets me know which 
node_modules install commands are required for the individual project.

Once the project is built, running gulp will perform default development operations, such as:

- open the project in a browser tab when starting the gulp command
- automatically reload the browser when html or js is saved
- live reload the window when css is saved
- compile sass and minify javascript, as needed (configurable in gulpfile.js)

# Project templates

One webgl project scaffolding starter template, creatively named "webgl". 

More template folders for different types of projects could easily be added. 
They probably will.

- webgl

# One-time Setup

Gulp Setup
This may help: http://travismaynard.com/writing/getting-started-with-gulp

Gulp Templates Setup
- Get this repo into your local computer. Or you can pick individual templates if you don't want all of them.
  - You will need the shell script "gulpinit" from this repo
  - You will also need at least one template, (one of the top-level folders in this repo), eg: "webgl"
- Modify the "gulpinit" file so that it knows the correct path to the root folder where you downloaded the templates. You will see where to set this path (at the top of the "gulpinit" file).
- Add the shell script "gulpinit" to your path so that you can call it from anywhere in the command line.

# New gulp project Setup

- Run "gulpinit" in your command line. From here, the shell script will tell you what you need to know and help you create the new project from the chosen template.
