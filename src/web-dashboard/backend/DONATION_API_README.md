# Donation API Documentation

This API provides endpoints for handling donations through Mastercard Payment Gateway Services (MPGS) integration.

## Environment Variables

Add the following to your `.env` file:

```env
# MPGS Payment Gateway Configuration
MERCHANT_ID=your_merchant_id_here
API_USERNAME=your_api_username_here
API_PASSWORD=your_api_password_here
```

## Endpoints

### 1. Create Payment Session

**POST** `/api/payment/session`

Creates a new payment session with MPGS for donation processing.

**Request Body:**
```json
{
  "order": {
    "currency": "LKR",
    "amount": "100.00"
  }
}
```

**Response:**
```json
{
  "success": true,
  "sessionId": "SESSION0001234567890",
  "session": {
    "id": "SESSION0001234567890",
    "version": "123456"
  }
}
```

### 2. Confirm Donation

**POST** `/api/donation/confirm`

Confirms a donation after payment processing and stores donor + donation data.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phone": "+94123456789",
  "amount": 100.00,
  "orderId": "ORDER123456",
  "transactionId": "TXN123456789",
  "sessionId": "SESSION0001234567890",
  "status": "SUCCESS"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Donation confirmed successfully",
  "donation": {
    "id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "amount": 100,
    "status": "SUCCESS",
    "orderId": "ORDER123456",
    "transactionId": "TXN123456789",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "donor": {
      "name": "John Doe",
      "email": "john.doe@example.com",
      "phone": "+94123456789"
    }
  }
}
```

### 3. Get All Donations

**GET** `/api/donations`

Retrieves all donations with donor details for the web dashboard.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50, max: 100)
- `status` (optional): Filter by status (PENDING, SUCCESS, FAILED, CANCELLED)
- `startDate` (optional): Filter by start date (ISO format)
- `endDate` (optional): Filter by end date (ISO format)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "amount": 100,
      "currency": "LKR",
      "status": "SUCCESS",
      "orderId": "ORDER123456",
      "transactionId": "TXN123456789",
      "sessionId": "SESSION0001234567890",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "donor": {
        "_id": "64f1a2b3c4d5e6f7g8h9i0j2",
        "name": "John Doe",
        "email": "john.doe@example.com",
        "phone": "+94123456789",
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1,
    "pages": 1
  }
}
```

### 4. Get Donation Statistics

**GET** `/api/donations/stats`

Retrieves donation statistics and analytics.

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalAmount": 1000,
      "totalDonations": 10,
      "successfulDonations": 9,
      "averageAmount": 100
    },
    "statusBreakdown": [
      {
        "_id": "SUCCESS",
        "count": 9,
        "totalAmount": 900
      },
      {
        "_id": "FAILED",
        "count": 1,
        "totalAmount": 100
      }
    ]
  }
}
```

## Error Handling

All endpoints return errors in the following format:

```json
{
  "success": false,
  "error": "Error description",
  "message": "Detailed error message"
}
```

## Security Notes

- Never log or store card details
- All sensitive payment data is handled by MPGS
- API credentials are stored in environment variables
- Input validation is performed on all endpoints
- HTTPS should be used in production

## Testing

Use the following test data for development:

- **Merchant ID**: Your test merchant ID from ITCA TEST folder
- **API Username**: Your test API username
- **API Password**: Your test API password

## Integration Flow

1. Mobile app calls `/api/payment/session` to get session ID
2. Mobile app redirects user to MPGS hosted checkout page
3. After payment, MPGS redirects back with result
4. Mobile app calls `/api/donation/confirm` with payment details
5. Backend stores donor and donation data
6. Web dashboard can retrieve donations via `/api/donations`
