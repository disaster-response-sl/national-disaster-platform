import React from 'react';
import { WebView } from 'react-native-webview';

interface PaymentWebViewProps {
  sessionData: any;
  formData: any;
  onMessage: (event: any) => void;
}

export const PaymentWebView: React.FC<PaymentWebViewProps> = ({ sessionData, formData, onMessage }) => {
  const generateHTML = () => {
    const sessionId = sessionData?.session?.id || '';
    const orderId = sessionData?.orderId || '';
    const amount = formData?.amount || '';
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Commercial Bank PayDPI</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            max-width: 400px;
            margin: 0 auto;
            background: white;
            border-radius: 10px;
            padding: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
        }
        .amount {
            font-size: 24px;
            font-weight: bold;
            color: #27ae60;
            margin: 10px 0;
        }
        .description {
            color: #666;
            margin-bottom: 20px;
        }
        .loading {
            text-align: center;
            padding: 20px;
            color: #666;
        }
        .error {
            background: #fee;
            border: 1px solid #fcc;
            padding: 15px;
            border-radius: 5px;
            color: #c00;
            margin: 10px 0;
        }
        .success {
            background: #efe;
            border: 1px solid #cfc;
            padding: 15px;
            border-radius: 5px;
            color: #060;
            margin: 10px 0;
        }
        .buttons {
            display: flex;
            gap: 8px;
            margin-top: 20px;
            flex-wrap: wrap;
        }
        .btn {
            flex: 1;
            min-width: 100px;
            padding: 12px 8px;
            border: none;
            border-radius: 5px;
            font-size: 14px;
            cursor: pointer;
            text-align: center;
        }
        .btn-primary {
            background: #3498db;
            color: white;
        }
        .btn-cancel {
            background: #95a5a6;
            color: white;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Complete Payment</h2>
            <div class="amount">LKR ${Number(amount).toLocaleString()}</div>
            <div class="description">Disaster Relief Donation</div>
        </div>
        
        <div id="payment-form">
            <div class="loading">Initializing secure payment...</div>
        </div>
        
        <div class="buttons">
            <button class="btn btn-cancel" onclick="cancelPayment()">Cancel</button>
            <button class="btn btn-primary" onclick="testPayment()">Test Payment</button>
        </div>
    </div>

    <script>
        var paymentData = {
            sessionId: "${sessionId}",
            orderId: "${orderId}",
            amount: "${amount}",
            merchantName: "TESTITCALANKALKR",
            currency: "LKR"
        };
        
        function testPayment() {
            document.getElementById('payment-form').innerHTML = 
                '<div class="success">✅ Payment completed successfully!<br><small>Transaction: CBC_SIM_' + Date.now() + '</small></div>';
            
            setTimeout(function() {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    success: true,
                    orderId: paymentData.orderId,
                    sessionId: paymentData.sessionId,
                    transactionId: 'CBC_SIM_' + Date.now(),
                    result: 'SUCCESS'
                }));
            }, 1000);
        }
        
        function cancelPayment() {
            window.ReactNativeWebView.postMessage(JSON.stringify({
                success: false,
                cancelled: true
            }));
        }
        
        // Auto-initialize with test payment message
        setTimeout(function() {
            document.getElementById('payment-form').innerHTML = 
                '<div class="error">Commercial Bank PayDPI integration requires proper server setup.<br><br>' +
                'Please use <strong>Test Payment</strong> to simulate the payment flow.</div>';
        }, 2000);
    </script>
</body>
</html>`;
  };

  return (
    <WebView
      source={{ html: generateHTML() }}
      onMessage={onMessage}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      startInLoadingState={true}
      scalesPageToFit={true}
      style={{ flex: 1 }}
    />
  );
};
