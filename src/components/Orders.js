import { useEffect } from "react";
import { BASE_URL, BASE_URL_CLOUD } from './Apiconstants';

function Orders() {

    useEffect(() => {
        fetch(`${BASE_URL}/shoppingcart/getcart`)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error("Something went wrong");
            }
        })
        .then(responseData => console.log(responseData))
        .catch(error => {
            console.log(error.message);
        })
    }, []);

    return (
        <>
        <div className="mainDiv">
            <h1>Tilaukset</h1>
        </div>
        </>
    )
};

export default Orders;