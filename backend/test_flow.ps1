# Test complete flow from registration to data scraping

# 1. Register new user
$registerBody = @{
    email = "test@example.com"
    password = "Test123!"
    full_name = "Test User"
    institution = "Test University"
    department = "Computer Science"
} | ConvertTo-Json

Write-Host "Registering new user..."
$registerResponse = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/auth/register" `
    -Method Post `
    -ContentType "application/json" `
    -Body $registerBody

Write-Host "Registration successful! User ID: $($registerResponse.id)"

# 2. Login
$loginForm = @{
    username = "test@example.com"
    password = "Test123!"
}

Write-Host "`nLogging in..."
$loginResponse = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/auth/login" `
    -Method Post `
    -Form $loginForm

$token = $loginResponse.access_token
Write-Host "Login successful! Token received."

# 3. Get user profile
$headers = @{
    Authorization = "Bearer $token"
}

Write-Host "`nFetching user profile..."
$profileResponse = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/auth/me" `
    -Method Get `
    -Headers $headers

Write-Host "Profile fetched successfully!"

# 4. Start scraping
Write-Host "`nStarting faculty data scraping..."
$scrapeResponse = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/faculty/scrape" `
    -Method Post `
    -Headers $headers

Write-Host "Scraping initiated: $($scrapeResponse.message)"

# 5. Wait a bit and then fetch faculty data
Start-Sleep -Seconds 10
Write-Host "`nFetching faculty data..."
$facultyResponse = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/faculty" `
    -Method Get `
    -Headers $headers

Write-Host "Found $($facultyResponse.Count) faculty members"

# 6. Search publications by domain
$searchDomain = "Artificial Intelligence"
Write-Host "`nSearching publications in domain: $searchDomain"
$searchResponse = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/faculty/search/$searchDomain" `
    -Method Get `
    -Headers $headers

Write-Host "Found $($searchResponse.Count) faculty members in $searchDomain domain" 