Now when a driver is created, automatically send an email to them once again using the NOREPLY smtp config with nodemailer welcoming them to the app[ and yet again, generate a random password and send ti along with the email]





On the admin side, add a "UserS" page which shiows in 3 cards and 1 table with foilter by role all the users currently on their zendak workspace, with a button for them to add a new user, this opens up a dialog that allows them to select the user's role, add their email

When a new user is added, a user is create din the db with a redable yet strong default password, and then using nodemailer and an SMTP config called NOREPLY_SMTP (for example NOREPLY_SMTP_FROM=) in the env, send an email to the user telling them they have been invited to the zendak workspace {nam,e} by their admin {admin.name} with their credentials (email _ randomly generated password), ensure that at rceatiln, they are tied to the corrcet workspace and they have the role selecte,d okay ?

Make commitsd at evert step