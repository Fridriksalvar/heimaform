"use client";

import { useEffect } from "react";

export default function Home() {
  // Load environment variables
  const merchantID = process.env.NEXT_PUBLIC_TEYA_MERCHANT_ID;
  const gatewayID = process.env.NEXT_PUBLIC_TEYA_GATEWAY_ID;
  const teyaURL = process.env.NEXT_PUBLIC_TEYA_LIVE_URL;
  const websiteURL = process.env.NEXT_PUBLIC_WEBSITE_URL;

  useEffect(() => {
    console.log("Merchant ID:", merchantID);
    console.log("Gateway ID:", gatewayID);
    console.log("Teya URL:", teyaURL);
    console.log("Website URL:", websiteURL);
  }, []);

  const handleCheckout = () => {
    if (!merchantID || !gatewayID || !teyaURL || !websiteURL) {
      console.error("Missing environment variables.");
      return;
    }

    const formData = new URLSearchParams({
      MerchantID: merchantID,
      PaymentGatewayID: gatewayID,
      AccessCode: process.env.NEXT_PUBLIC_TEYA_SECRET_KEY,
      Amount: 1000, // 1000 ISK for testing
      Currency: "ISK",
      OrderNumber: `TEST_${Date.now()}`,
      ReturnUrlSuccess: `${websiteURL}/thank-you`,
      ReturnUrlCancel: `${websiteURL}/cart`,
      ReturnUrlError: `${websiteURL}/cart`,
      Language: "IS",
      TransactionType: "SALE",
      Encoding: "UTF-8",
    }).toString();

    const paymentURL = `${teyaURL}?${formData}`;
    console.log("Redirecting to:", paymentURL);
    window.location.href = paymentURL;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Checkout Page</h1>
      <button
        onClick={handleCheckout}
        className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition"
      >
        Pay with Teya
      </button>
    </div>
  );
}
