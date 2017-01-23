# To-do application
**1. History of the project**

In the first version  it was planned to be with 3 fixed  task categories HTML, CSS and JavaScript,  had only 2 functionalities to create and delete tasks .

Second version(Current), it was no more focused on three  exact categories. The user  had the chance to create as many as he wants categories. For every element there was custom animation for creating or deleting. In this version everything  was static and the information was not saved on server.
Also when creating category there are few options to personalize the category:

* Add title
* Add title color
* Add category background
* Add  screen position - there are three screen positions(left, middle, right), this works only on devices with larger screens.

When Category is created  users can remove it or choose to create task.

* There are 3 tasks counters-  total tasks counts, tasks to finish, finished tasks.

Task options:

* Checked - for when its ready;
* Edit - separate box is created to edit the task;
* Remove - removing the task for the selected category

**2. Current version updates.**

 The functionality is the same, but preparations for non-static version alreay started. Now for every category is created new object Category, which is saved in array-  categories.
 
 22.1.2017 - Default buttons were changed with icons, added  navigation and about section, small changes on the  tasks design.

**3. Stuff to add.**

 Add more options like making task important, change font-size type...
 To add drag and drop functionality, to find host when everything can be saved to user profile;
