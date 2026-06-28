$ports = @(3000, 8080, 5173)

foreach ($port in $ports) {
    try {
        $connections = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction Stop
        foreach ($connection in $connections) {
            Stop-Process -Id $connection.OwningProcess -Force -ErrorAction SilentlyContinue
            Write-Host "Stopped process on port $port"
        }
    } catch {
        Write-Host "No listener found on port $port"
    }
}

