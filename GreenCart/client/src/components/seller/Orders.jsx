import { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import { assets, dummyOrders } from "../../assets/assets";

const Orders = () => {
  const { currency } = useAppContext();
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    setOrders(dummyOrders);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="flex-1 h-[95vh] overflow-y-auto no-scrollbar">
      <div className="p-4 md:p-10 space-y-6 max-w-6xl mx-auto">
        <h2 className="text-2xl font-semibold">Orders List</h2>

        {orders.map((order, index) => (
          <div
            key={index}
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 p-5 rounded-lg border border-gray-300 bg-white shadow-sm"
          >
            {/* Product Items */}
            <div className="flex gap-4 w-full md:max-w-xs">
              <img
                className="w-14 h-14 object-cover rounded"
                src={assets.box_icon}
                alt="boxIcon"
              />
              <div className="flex flex-col gap-1">
                {order.items.map((item, idx) => (
                  <p key={idx} className="font-medium text-gray-800">
                    {item.product.name}{" "}
                    <span className="text-primary"> × {item.quantity}</span>
                  </p>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="text-sm text-gray-600 flex-1">
              <p className="font-medium text-gray-800">
                {order.address.firstName} {order.address.lastName}
              </p>
              <p>{order.address.street}, {order.address.city}</p>
              <p>{order.address.state}, {order.address.zipcode}, {order.address.country}</p>
              <p>{order.address.phone}</p>
            </div>

            {/* Order Amount */}
            <p className="font-semibold text-lg text-gray-900">{currency}{order.amount}</p>

            {/* Payment Info */}
            <div className="text-sm text-gray-600 text-right md:text-left">
              <p>Method: <span className="font-medium">{order.paymentType}</span></p>
              <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
              <p>
                Payment:{" "}
                <span
                  className={`font-medium ${
                    order.isPaid ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {order.isPaid ? "Paid" : "Pending"}
                </span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
