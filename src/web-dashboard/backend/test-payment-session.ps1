# PowerShell script to test Commercial Bank PayDPI payment session
$headers = @{
    "Content-Type" = "application/json"
}

$body = @{
    order = @{
        currency = "LKR"
        amount = 1500
        description = "Disaster Relief Donation"
    }
    interaction = @{
        operation = "PURCHASE"
        displayControl = @{
            billingAddress = "HIDE"
            customerEmail = "HIDE" 
            shipping = "HIDE"
        }
        returnUrl = "https://www.abcd.lk"
    }
    billing = @{
        address = @{
            city = "Colombo"
            country = "LKA"
            postcodeZip = "10100"
            stateProvince = "Western"
        }
    }
    customer = @{
        email = "test@example.com"
        firstName = "John"
        lastName = "Doe"
        phone = "+94771234567"
    }
} | ConvertTo-Json -Depth 10

Write-Host "Testing payment session creation..."
Write-Host "Request body: $body"

try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/payment/session" -Method POST -Headers $headers -Body $body
    Write-Host "✅ SUCCESS!" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10 | Write-Host
} catch {
    Write-Host "❌ ERROR:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host "Details:" $_.ErrorDetails.Message -ForegroundColor Red
    }
}
