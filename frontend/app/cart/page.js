"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Cart() {
  const [cart, setCart] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    const savedCart = localStorage.getItem("cart");
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [cart, isMounted]);

  const removeFromCart = (index) => {
    if (isMounted) {
      const newCart = cart.filter((_, i) => i !== index);
      setCart(newCart);
      localStorage.setItem("cart", JSON.stringify(newCart));
    }
  };

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  const handleCheckout = (e) => {
    e.preventDefault();
    if (!isMounted) return;

    if (!name.trim() || !email.trim() || !address.trim()) {
      console.error("Missing customer details: Name, Email, or Address are required");
      return;
    }

    const formData = new URLSearchParams({
      MerchantID: process.env.NEXT_PUBLIC_TEYA_MERCHANT_ID,
      PaymentGatewayID: process.env.NEXT_PUBLIC_TEYA_GATEWAY_ID,
      AccessCode: process.env.NEXT_PUBLIC_TEYA_SECRET_KEY,
      Amount: total * 100, // Convert to smallest currency unit (ISK)
      Currency: "ISK",
      OrderNumber: `HEIMAFORM_${Date.now()}`,
      CustomerName: encodeURIComponent(name.trim()),
      CustomerEmail: encodeURIComponent(email.trim()),
      CustomerAddress: encodeURIComponent(address.trim()),
      Recurring: "Y",
      RecurringInterval: "30",
      RecurringStartDate: new Date().toISOString().split("T")[0],
      ReturnUrlSuccess: `${process.env.NEXT_PUBLIC_BASE_URL}/thank-you`,
      ReturnUrlCancel: `${process.env.NEXT_PUBLIC_BASE_URL}/cart`,
      ReturnUrlError: `${process.env.NEXT_PUBLIC_BASE_URL}/cart`,
      Language: "IS",
      TransactionType: "SALE",
      Encoding: "UTF-8",
    }).toString();

    const securePayUrl = `${process.env.NEXT_PUBLIC_TEYA_LIVE_URL}?${formData}`;
    console.log("Redirecting to SecurePay:", securePayUrl);

    try {
      window.location.href = securePayUrl;
    } catch (error) {
      console.error("Redirect failed:", error);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Your Cart</h1>
      {cart.length === 0 ? (
        <p className="text-center text-gray-500">Cart is empty</p>
      ) : (
        <>
          <div className="max-w-2xl mx-auto">
            {cart.map((item, index) => (
              <div key={index} className="bg-white p-4 mb-4 shadow-md rounded-lg flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold">{item.name}</h2>
                  <p>{new Intl.NumberFormat('is-IS', { style: 'decimal' }).format(item.price)}kr.- á mánuði</p>
                </div>
                <button
                  onClick={() => removeFromCart(index)}
                  className="bg-red-600 text-white p-2 rounded hover:bg-red-700"
                >
                  Remove from Cart
                </button>
              </div>
            ))}
            <p className="text-xl font-bold">Total: {new Intl.NumberFormat('is-IS', { style: 'decimal' }).format(total)}kr.- á mánuði</p>
          </div>
          <form onSubmit={handleCheckout} className="max-w-xl mx-auto mt-6 bg-white p-6 shadow-md rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Checkout</h2>
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="block w-full p-2 border rounded mb-2"
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full p-2 border rounded mb-2"
            />
            <input
              type="text"
              placeholder="Delivery Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="block w-full p-2 border rounded mb-4"
            />
            <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">
              Pay with Teya
            </button>
          </form>
        </>
      )}
    </div>
  );
}
