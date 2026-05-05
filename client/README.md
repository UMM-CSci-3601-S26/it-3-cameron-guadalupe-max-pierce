# Ready4Learning Interface

## Getting Started

The Dashboard displays an info-tile overview of some basic aspects of our project; including the current number of families and students registered, the current number of inventory entries, the current number of items stocked in the inventory, the number of available schools, and low-stock items. (When inventory items fall below a given threshold, a notification appears here.) Lastly, the Dashboard indicates the current system status- including whether there are unread notifications, and whether the server is currently available.
The Settings, Inventory, Grade Requirements, Family List, and Shopping List can all be accessed from the sidebar in the top left of the screen, or using the buttons on the homepage.

## Settings

The settings page allows administrators to configure various parts of the interface. The available schools and times can be configured here, as well as the available item types for the inventory, grade requirements, and shopping list.

## Inventory

The inventory page displays the organization’s current inventory. This page features filtering options for name, location, type, and description; the inventory can also be sorted in order of name, location, and quantity, or partitioned into different item types using the ‘sort by’ option. The display can be switched between list and grid view.
Inventory items must have a name, quantity, type, location, and pack number. (The number of items in each package.) In addition, items can have an optional description.
Each entry in the item list can be selected, and selected elements can have their location reset, in the event items need to be moved. Clicking an item opens up a page to modify that item’s properties; the quantity of an item can also be adjusted by clicking the quick-adjustment buttons on the left of each entry. New items can be added using the plus bottom at the bottom right of the screen; however, items should generally be added from the grade list to ensure naming consistency. The inventory list can be exported as a CSV, using the ‘Export to CSV’ button. Any sorting or filtering methods are applied in the resulting CSV.
And lastly, the list reset button resets the entire list.

## Grade Requirements

Similar to the Inventory, the Grade Requirements page lists the requested items for each school and grade supported by the organization. (Schools can be added and removed in settings.) The Grade Requirements can be sorted like the inventory, but can also be partitioned by grade, school, or both.
Grade Requirements have the same properties as Inventory Items, but do not track location, and instead track the grade and school that requires this item. When determining a student’s requirements, any items with a matching grade and school are used.
Clicking a requirement allows its properties to be modified, in the same manner as inventory. New requirements can be added using the plus button at the bottom right of the screen; while in the grade and school view, users can also use the ‘add requirement’ buttons associated with each grade to add a new requirement with the grade and school fields prefilled.
Each grade and school also features an ‘add to inventory’ button, which automatically adds all requirements to the inventory as unstocked items. Preferably, users should add items to the Grade Requirements page first, then populate the inventory with Grade Requirements to ensure naming consistency between the two services.
The list reset button, appropriately enough, still clears the entire list.

## Survey

The survey is linked to the Family List page, using the plus button at the bottom right of the screen. There are two parts of the survey; one for info about homes and parents and another for student information. The survey features localization support for Spanish, and also supports mobile view.
In the first section of the survey, the administrator or parent enters names, an email address, a phone number, and a desired pickup time. (Available pickup times can be chosen in settings). For each student, a name, grade, and school are required; as well as whether or not each student requires a backpack and/or headphones. A teacher can be optionally provided, but is unused for the shopping list. Additional students can be added or removed.
Resetting the survey removes all information; and submitting the survey adds a family to the family list. Families can be added manually by administrators, or by providing recipients with the survey link. For this reason, the rest of the website is not accessible from the survey.

## Family List

The family list tracks all families currently signed up to receive supplies; it supports filtering by name, school, grade, and time; as well as sorting by various properties, and partitioning into grades, schools, or both.
Clicking on a family reveals information about each family’s students. When sorting by grade or school, families with students in multiple grades may appear multiple times: an additional indicator notes the number of students a family has in a given grade.
The edit (✎) button attached to each family opens a page to modify a family’s information. In addition, the download (⬇) button downloads a PDF with a checklist of requirements for each of the family’s students. (The ‘Download PDF’ button at the top of the screen downloads all Checklists as a single PDF.)
The list reset button, as expected, clears the entire family list.

## Shopping List

The shopping list page uses the currently enrolled families, grade requirements, and inventory to generate a list of required items, which updates dynamically as students or requirements are added. The ‘subtract inventory’ setting determines whether or not inventory is taken into consideration; while active, any matching items in inventory will be subtracted from the shopping list.
Like Grade Requirements, the shopping list can be filtered and partitioned by various properties. The quantities of each item reflect the number of items needed for the entire supply drive. The ‘Export CSV’ button again exports the entire shopping list as a spreadsheet. Because the list is generated dynamically, there is unfortunately no need for a reset button.

## Development & Deployment Instructions (Max?)

Go to Digital Ocean website, and create an account with the github student pack. Then go to the droplets page on Digital Ocean and create a Droplit for your team. Use either the basic 2gb or upgraded 4gb droplet (this one seems to work the best), scroll down and choose your region and create a strong password so other people cannot easily access your page. It will then create your droplet and give you a droplet ID which will be used right away, open the droplet terminal found on your droplet setting and ssh into ssh root@[droplet ip here] then enter the password you set for your droplet previously. Next you're gonna wanna install docker-compose with apt install docker-compose. Next you're gonna wanna run the command git clone [enter repo URL here]. Cd [ repo name] into new directory and run ./setupdroplet.sh this will run initial setup, finally run command docker-compose up -d this starts your server and to stop server docker-compose down. To update your server docker-compose down, then git pull, rebuild server with docker-compose up --build -d.
Other commands include setting new repo as main - docker-compose down, get remote set-url origin [new repo], git pull origin main, then docker-compose up -d –-build.

## Built With…

The Ready4Learning Interface makes use of the following tools and libraries, along with various other dependencies listed in the provided source code:
Angular
Angular Unit Testing
TypeScript (Client Logic)
HTML
JAVA (Server Logic)
Java Script
SCSS (Styling)
Javalin (Server Side)
MongoDB (Database)
JSON (Seed Data)
Cypress (E2E)
