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
import SendFeedback from './components/Feedback';
import SearchRecords from './components/SearchRecords';
import SearchedRecords from './components/SearchedRecords';
import TermsOfUse from './components/Termsofuse';
import PrivacyStatement from './components/Privacystatement';
import "./App.css";
import { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Link, Routes } from "react-router-dom";
import { TextField } from '@mui/material';
import "./styling/Navbar.css";
import SearchIcon from '@mui/icons-material/Search';
import IconButton from '@mui/material/IconButton';
import { BASE_URL, BASE_URL_CLOUD } from './components/Apiconstants';
import socket from './components/socket';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState({
    email: "",
    role: "",
    id: null,
    token: null
  });

  const [conversationId, setConversationId] = useState(null);
  const [conversationMessages, setConversationMessages] = useState([]);
  const [adminAllConversationMessages, setAdminAllConversationMessages] = useState([]);
  const [adminConversationIds, setAdminConversationIds] = useState([]);
  const [newMessageState, setNewMessageState] = useState(false);
  const [adminNewMessageIds, setAdminNewMessageIds] = useState([]);
  const [adminNewMessagesSinceLogin, setAdminNewMessagesSinceLogin] = useState([]);
  const [shoppingcart, setShoppingcart] = useState([]);
  const [token, setToken] = useState(null)
  const [shoppingcartSize, setShoppingcartSize] = useState(0);
  const [activePath, setActivePath] = useState("/");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);


  //Idk if this will be used anymore, if anything I should make all of the things that use token use the token state as above ^ CURRENTLY USED ONLY IN LOGIN. Fix maybe?
  const token1 = localStorage.getItem("jwtToken")

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

  //The fetching of conversation id and message logic is moved here from Chat component in order to track the websockets accordingly, wasn't possible before when websocket logic was inside Chat component.
  const fetchConversationId = () => {
    if (!isLoggedIn || localStorage.getItem("loggedInUserRole") === "ADMIN") {
      return;
    }
    console.log(localStorage.getItem("loggedInUserId"))

    fetch(`${BASE_URL_CLOUD}/chat/getconversationid/${localStorage.getItem("loggedInUserId")}`)
      .then(response => {
        if (response.ok) {
          return response.json()
        } else {
          throw new Error("Failed to fetch conversation ID");
        }
      })
      .then(data => {
        if (data.length > 0) {
          setConversationId(data[0].id);
        } else {
          console.error("No conversation ID found");
        }
      })
      .catch(error => {
        console.error("Error fetching conversation ID:", error);
      });
  }


  const fetchConversationMessages = () => {
    //This is added because for whatever reason in cloud implementation it fetches the conversation messages with id 0.
    //This prevents it from happening, don't know why this happens, maybe explanation will be found out later.
    if (conversationId === null) {
      return;
    }

    fetch(`${BASE_URL_CLOUD}/chat/getconversationmessages/${conversationId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
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
            //console.log("Unmount time is not available in localStorage.");
          }
        }
      })
  }

  const fetchConversationMessagesAdmin = () => {
    if (localStorage.getItem("loggedInUserRole") !== "ADMIN") {
      return;
    }

    fetch(`${BASE_URL_CLOUD}/chat/getallconversationmessages`)
      .then(response => {
        if (response.ok) {
          return response.json()
        } else {
          throw new Error("Something went wrong while fetching all conversation messages");
        }
      })
      .then(responseData => {
        setAdminAllConversationMessages(responseData);

        //Same message filtering is done for the admin. Filter admin messges --> Check if new messages from other users have arrived according to the timestamp.
        const userMessages = responseData.filter(message => message.sender_id !== loggedInUser.id);

        if (userMessages.length > 0) {
          const latestMessage = userMessages[userMessages.length - 1].created_at;

          const unmountTime = localStorage.getItem("unmountTime");

          if (unmountTime) {
            const latestMessageDate = new Date(latestMessage);
            const unmountTimeDate = new Date(unmountTime);

            // Filter messages that arrived after the unmount time
            const newMessagesArr = userMessages.filter(message => new Date(message.created_at) > unmountTimeDate);
            setAdminNewMessagesSinceLogin(newMessagesArr);

            // Extract unique sender IDs
            const uniqueSenderIds = [...new Set(newMessagesArr.map(message => message.sender_id))];
            setAdminNewMessageIds(uniqueSenderIds);

            if (latestMessageDate > unmountTimeDate) {
              setNewMessageState(true);
            }
          }
        }
      })
  }

  const fetchConversationIdsAdmin = () => {
    if (localStorage.getItem("loggedInUserRole") !== "ADMIN") {
      return;
    }

    fetch(`${BASE_URL_CLOUD}/chat/getallconversationids`)
      .then(response => {
        if (response.ok) {
          return response.json()
        } else {
          throw new Error("Something went wrong while fetching all conversation ids.");
        }
      })
      .then(responseData => {
        setAdminConversationIds(responseData);
      })
  }

  //This useEffect is ran if normal user logs in.
  useEffect(() => {
    if (localStorage.getItem("isLoggedIn") !== null && localStorage.getItem("loggedInUserRole") !== "ADMIN") {
      fetchConversationId();
      fetchConversationMessages();
    }
  }, [isLoggedIn])

  //This useEffect is ran if admin logs in.
  useEffect(() => {
    if (localStorage.getItem("isLoggedIn") !== null && localStorage.getItem("loggedInUserRole") === "ADMIN") {
      fetchConversationMessagesAdmin();
      fetchConversationIdsAdmin();
    }
  }, [isLoggedIn])

  useEffect(() => {
    //This is here to stop admin joining to the socket when he joins a chat room, admin already is connected to every room socket, so only causes issues if he joins rooms again.
    if (localStorage.getItem("loggedInUserRole") === "ADMIN") {
      return;
    }
    if (conversationId) {
      socket.emit("joinRoom", conversationId);
    }
  }, [conversationId]);

  //This useEffect is used to handle the socket logic for non-admin users. 
  useEffect(() => {
    if (localStorage.getItem("loggedInUserRole") === "ADMIN") {
      return;
    }
    socket.on("message", (message) => {
      if (message.conversationId === conversationId) {
        setConversationMessages(prevMessages => [...prevMessages, message]);
        setNewMessageState(true);
      }
    });

    return () => {
      socket.off("message");
    };
  }, [conversationId]); //This dependency array needs to be here. I don't quite understand why, but that is the way things are. :)

  //Socket logic for admin user.
  useEffect(() => {
    if (localStorage.getItem("loggedInUserRole") !== "ADMIN") {
      return;
    }

    const handleMessage = (message) => {
      if (message.conversationId === conversationId) {
        setConversationMessages(prevMessages => [...prevMessages, message]);
        setNewMessageState(true);
        return;
      }

      adminConversationIds.forEach(id => {
        if (message.conversationId === id.id) {
          setNewMessageState(true);

          // Add the conversationId to the adminNewMessageIds state if it doesn't already exist
          setAdminNewMessageIds((prevIds) => {
            if (!prevIds.includes(message.sender_id)) {
              return [...prevIds, message.sender_id];
            }
            return prevIds;
          });
        }
      });
    };

    socket.on("message", handleMessage);

    // Joining rooms for the admin user
    adminConversationIds.forEach(id => {
      socket.emit('joinRoom', id.id);
    });

    return () => {
      socket.off("message", handleMessage);
    };
  }, [isLoggedIn, adminConversationIds, conversationId]);

  // Function to show shopping cart
  const showShoppingcart = () => {
    if (localStorage.getItem("loggedInUserRole") === "ADMIN") {
      return;
    }
    fetch(`${BASE_URL_CLOUD}/shoppingcart/shoppingcartitems/${loggedInUser.id}`)
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Failed to fetch shopping cart items');
        }
      })
      .then(responseData => {
        setShoppingcartSize(responseData.length)
      })
      .catch(error => console.error('Error:', error));
  };

  // useEffect to trigger showShoppingcart
  useEffect(() => {
    if (loggedInUser.id) {
      showShoppingcart();
    }
  }, [token, loggedInUser.id]);

  const clickedLink = (path, setActivePath) => {
    setSearchOpen(false);
    localStorage.setItem("path", path);
    setActivePath(path);
  };

  useEffect(() => {
    const savedPath = localStorage.getItem("path");
    if (savedPath) {
      setActivePath(savedPath);
    }
  }, []);

  const openSearch = () => {
    if (searchOpen === true) {
      setSearchOpen(false);
    } else {
      setSearchOpen(true);
    }
  }

  return (
    <Router>
      <div>
        <nav className="navbar">
          <div className="nav-left">
            <Link
              to="/"
              className={`nav-link logo ${activePath === "/" ? "active" : ""}`}
              onClick={() => clickedLink("/", setActivePath)}
            >
              Etusivu
            </Link>
            <Link
              to="/records"
              className={`nav-link ${activePath === "/records" ? "active" : ""}`}
              onClick={() => clickedLink("/records", setActivePath)}
            >
              Levylista
            </Link>
            {isLoggedIn && (
              <Link
                to="/chat"
                className={`nav-link ${activePath === "/chat" ? "active" : ""}`}
                onClick={() => clickedLink("/chat", setActivePath)}
              >
                Chatti
                {newMessageState && <span className="notification-badge"></span>}
              </Link>
            )}
            {isLoggedIn && loggedInUser.role !== "ADMIN" && (
              <Link
                to="/ownorders"
                className={`nav-link ${activePath === "/ownorders" ? "active" : ""}`}
                onClick={() => clickedLink("/ownorders", setActivePath)}
              >
                Omat Tilaukseni
              </Link>
            )}
            {isLoggedIn && loggedInUser.role === "ADMIN" && (
              <>
                <Link
                  to="/addrecord"
                  className={`nav-link ${activePath === "/addrecord" ? "active" : ""}`}
                  onClick={() => clickedLink("/addrecord", setActivePath)}
                >
                  Lisää Levy
                </Link>
                <Link
                  to="/orders"
                  className={`nav-link ${activePath === "/orders" ? "active" : ""}`}
                  onClick={() => clickedLink("/orders", setActivePath)}
                >
                  Tilaukset
                </Link>
              </>
            )}
            {isLoggedIn && loggedInUser.role !== "ADMIN" && (
              <Link
                to="/sendfeedback"
                className={`nav-link ${activePath === "/sendfeedback" ? "active" : ""}`}
                onClick={() => clickedLink("/sendfeedback", setActivePath)}
              >
                Lähetä Palautetta
              </Link>
            )}
            {loggedInUser.role !== "ADMIN" && (
              <>
                <IconButton style={{ color: "white" }} onClick={() => openSearch()}>
                  <SearchIcon />
                </IconButton>
                {searchOpen && (
                  <SearchRecords setSearchOpen={setSearchOpen} searchResults={searchResults} setSearchResults={setSearchResults} />
                )}
              </>
            )}

          </div>
          <div className="nav-right">
            {isLoggedIn && loggedInUser.role !== "ADMIN" && (
              <Link
                to="/shoppingcart"
                className={`nav-link nav-link-shoppingcart ${activePath === "/shoppingcart" ? "active" : ""}`}
                onClick={() => clickedLink("/shoppingcart", setActivePath)}
              >
                <ShoppingCartIcon />
                {shoppingcartSize >= 0 && <span className="notification-badge-shoppingcart notification-badge">{shoppingcartSize}</span>}
              </Link>
            )}
            {!isLoggedIn && (
              <>
                <Link
                  to="/createuser"
                  className={`nav-link ${activePath === "/createuser" ? "active" : ""}`}
                  onClick={() => clickedLink("/createuser", setActivePath)}
                >
                  Luo Käyttäjä
                </Link>
                <Link
                  to="/login"
                  className={`nav-link ${activePath === "/login" ? "active" : ""}`}
                  onClick={() => clickedLink("/login", setActivePath)}
                >
                  Kirjaudu Sisään
                </Link>
              </>
            )}
            {isLoggedIn && (
              <Logout setIsLoggedIn={setIsLoggedIn} setLoggedInUser={setLoggedInUser} />
            )}
          </div>
        </nav>
        <Routes>
          <Route path="/" element={<FrontPage />} />
          <Route path="/records" element={<Records isLoggedIn={isLoggedIn} loggedInUser={loggedInUser} showShoppingcart={showShoppingcart} />} />
          <Route path="/createuser" element={<CreateUser />} />
          <Route path="/login" element={<Login isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} loggedInUser={loggedInUser} setLoggedInUser={setLoggedInUser} setToken={setToken} />} />
          <Route path="/shoppingcart" element={<Shoppingcart loggedInUser={loggedInUser} customerInfo={customerInfo} setCustomerInfo={setCustomerInfo} cartTotal={cartTotal} setCartTotal={setCartTotal} shoppingcart={shoppingcart} setShoppingcart={setShoppingcart} setShoppingcartSize={setShoppingcartSize} />} />
          <Route path="/chat" element={<ChatRoom loggedInUser={loggedInUser} conversationId={conversationId} setConversationId={setConversationId} conversationMessages={conversationMessages} setConversationMessages={setConversationMessages} fetchConversationId={fetchConversationId} fetchConversationMessages={fetchConversationMessages} newMessageState={newMessageState} setNewMessageState={setNewMessageState} adminNewMessageIds={adminNewMessageIds} setAdminNewMessageIds={setAdminNewMessageIds} />} />
          <Route path="/addrecord" element={<AddRecord loggedInUser={loggedInUser} />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/ordersummary" element={<Ordersummary customerInfo={customerInfo} cartTotal={cartTotal} loggedInUser={loggedInUser} />} />
          <Route path='/deleteuser' element={<DeleteUser loggedInUser={loggedInUser} />} />
          <Route path='/ownorders' element={<OwnOrders loggedInUser={loggedInUser} />} />
          <Route path='/sendfeedback' element={<SendFeedback loggedInUser={loggedInUser} />} />
          <Route path='/search' element={<SearchedRecords searchResults={searchResults} loggedInUser={loggedInUser} showShoppingcart={showShoppingcart} />} />
          <Route path="/termsofuse" element={<TermsOfUse />} />
          <Route path="/privacystatement" element={<PrivacyStatement />} />
        </Routes>
      </div>
    </Router>
  );

}

export default App;
