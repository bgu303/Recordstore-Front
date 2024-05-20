import './App.css';
import FrontPage from './components/Frontpage';
import Records from './components/Records';
import CreateUser from './components/Createuser';
import Login from './components/Login';
import Shoppingcart from './components/Shoppingcart';
import Logout from './components/Logout';
import AddRecord from './components/Addrecord';
import Ordersummary from './components/Ordersummary';
import ChatRoom from './components/Chat';
import DeleteUser from './components/Deleteuser';
import Orders from './components/Orders';
import OwnOrders from './components/OwnOrders';
import "./App.css";
import { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Link, Routes } from "react-router-dom";
import "./styling/Navbar.css";
import { BASE_URL, BASE_URL_CLOUD } from './components/Apiconstants';
import socket from './components/socket';

function App() {

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState({
    email: "",
    role: "",
    id: null,
    token: null
  });
  const [conversationId, setConversationId] = useState(null)
  const [conversationMessages, setConversationMessages] = useState([]);
  const [newMessageState, setNewMessageState] = useState(false)

  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phoneNumber: "",
    email: "",
    address: "",
    paymentOption: "",
    shippingOption: ""
  });

  const [cartTotal, setCartTotal] = useState(0);

  useEffect(() => {
    const storedIsLoggedIn = localStorage.getItem("isLoggedIn");
    const storedUserId = localStorage.getItem("loggedInUserId");
    const storedUserEmail = localStorage.getItem("loggedInUserEmail");
    const storedUserRole = localStorage.getItem("loggedInUserRole");
    const storedToken = localStorage.getItem("jwtToken");

    if (storedIsLoggedIn === "true") {
      setIsLoggedIn(true);
      setLoggedInUser({
        email: storedUserEmail,
        role: storedUserRole,
        id: parseInt(storedUserId, 10),
        token: storedToken
      });
    }
  }, []);

  //The fetching of conversation id and message logic is moved here from Chat component in order to track the websockets accordingly, wasnt possible before when websocket logic was inside Chat component.
  const fetchConversationId = () => {
    if (localStorage.getItem("loggedInUserRole") === "ADMIN") {
      return;
    }

    fetch(`${BASE_URL}/chat/getconversationid/${localStorage.getItem("loggedInUserId")}`)
      .then(response => {
        if (response.ok) {
          return response.json()
        }
      })
      .then(data => {
        setConversationId(data[0].id)
      })
  }

  const fetchConversationMessages = () => {
    //This is added because for whatever reason in cloud implementation it fetches the conversation messages with id 0.
    //This prevents it from happening, don't know why this happens, maybe explanation will be found out later.
    if (conversationId === null) {
      return;
    }
    fetch(`${BASE_URL}/chat/getconversationmessages/${conversationId}`)
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Something went wrong");
        }
      })
      .then(responseData => {
        setConversationMessages(responseData)

        //Fetch the latest message, which is NOT from the user - compared to the timestamp fetched from the chat, to find out if new messages have arrived or not.
        const adminMessages = responseData.filter(message => message.sender_id !== loggedInUser.id);

        if (adminMessages.length > 0) {
          const latestMessage = adminMessages[adminMessages.length - 1].created_at;

          const unmountTime = localStorage.getItem("unmountTime");

          if (unmountTime) {
            const latestMessageDate = new Date(latestMessage);
            const unmountTimeDate = new Date(unmountTime);

            //If latestmessage is newer than last been in chat  -> setNewMessage is true -> Chat bubble is shown.
            if (latestMessageDate > unmountTimeDate) {
              console.log("The latest message is newer than the unmount time.");
              setNewMessageState(true);
            }
            console.log("Unmount time is not available in localStorage.");
          }
        }
      })
  }

  useEffect(() => {
    if (localStorage.getItem("isLoggedIn") !== null) {
      fetchConversationId()
      fetchConversationMessages()
    }
  }, [isLoggedIn])

  useEffect(() => {
    if (conversationId) {
      socket.emit('joinRoom', conversationId);
    }
  }, [conversationId]);

  useEffect(() => {
    socket.on("message", (message) => {
      console.log("Received new message:", message);
      if (message.sender_id != localStorage.getItem("loggedInUserId")) {
        setNewMessageState(true)
      }
      setConversationMessages(prevMessages => [...prevMessages, message]);
    });

    return () => {
      socket.off("message"); // Cleanup when component unmounts
    };
  }, [conversationId]); //This dependency array needs to be here. I don't quite understand why, but that is the way things are. :)

  return (
    <Router>
      <div>
        <nav>
          <nav className="navbar">
            <Link to="/" className="nav-link">Etusivu</Link>
            <Link to="/records" className="nav-link">Levylista</Link>
            {isLoggedIn && <Link to="/shoppingcart" className="nav-link">Ostoskori</Link>}
            {isLoggedIn && <Link to="/chat" className="nav-link">
              Chatti
              {newMessageState && <span className="notification-badge"></span>}
            </Link>}
            {isLoggedIn && loggedInUser.role !== "ADMIN" && <Link to="/ownorders" className="nav-link">Omat Tilaukseni</Link>}
            {isLoggedIn && loggedInUser.role === "ADMIN" && <Link to="/addrecord" className="nav-link">Lisää Levy</Link>}
            {isLoggedIn && loggedInUser.role === "ADMIN" && <Link to="/orders" className="nav-link">Tilaukset</Link>}
            {!isLoggedIn && <Link to="/createuser" className="nav-link">Luo Käyttäjä</Link>}
            {!isLoggedIn && <Link to="/login" className="nav-link">Kirjaudu Sisään</Link>}
            {isLoggedIn && <Logout setIsLoggedIn={setIsLoggedIn} setLoggedInUser={setLoggedInUser} />}
          </nav>
        </nav>
        <Routes>
          <Route path="/" element={<FrontPage />} />
          <Route path="/records" element={<Records isLoggedIn={isLoggedIn} loggedInUser={loggedInUser} />} />
          <Route path="/createuser" element={<CreateUser />} />
          <Route path="/login" element={<Login isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} loggedInUser={loggedInUser} setLoggedInUser={setLoggedInUser} />} />
          <Route path="/shoppingcart" element={<Shoppingcart loggedInUser={loggedInUser} customerInfo={customerInfo} setCustomerInfo={setCustomerInfo} cartTotal={cartTotal} setCartTotal={setCartTotal} />} />
          <Route path="/chat" element={<ChatRoom loggedInUser={loggedInUser} conversationId={conversationId} setConversationId={setConversationId} conversationMessages={conversationMessages} setConversationMessages={setConversationMessages} fetchConversationId={fetchConversationId} fetchConversationMessages={fetchConversationMessages} newMessageState={newMessageState} setNewMessageState={setNewMessageState} />} />
          <Route path="/addrecord" element={<AddRecord />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/ordersummary" element={<Ordersummary customerInfo={customerInfo} cartTotal={cartTotal} />} />
          <Route path='/deleteuser' element={<DeleteUser loggedInUser={loggedInUser} />} />
          <Route path='/ownorders' element={<OwnOrders loggedInUser={loggedInUser} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
