# Record store Frontend

Record store for my dad's records to sell :)

## Technologies used
- React
- MUI library used for most of the styling
- Connected through REST-API to my Express back-end

## Features
- **User creation and Login:** Record list can be accessed without user, but to buy records, user creation is needed.
- **Buying records:** Users can buy records through the page by adding them to shopping cart.
- **Admin panel:** Implemented CRUD for admin user. Admin user is for my dad to update the page himself.
- **Ability to chat with admin:** Has working chat page which allows communication with page admin. Chatting with other users not possible.
- **Real time chat:** Chat works in real time using Socket.IO. More information about Socket.IO can be found at https://socket.io/
- **E-mail implementation:** Currently has no payment options, but rather sends the shopping cart data as e-mail to my dad to handle things eg. payment manually. E-mail implementation is done using SendGrid. https://sendgrid.com/

...To be continued..
