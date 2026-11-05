Add-Type -AssemblyName System.Drawing
$files = @("pocket-card", "daily-limit", "bill-guard", "goal-ring", "coins-star")
foreach ($f in $files) {
    $img = [System.Drawing.Bitmap]::new("public\welcome\$f.png")
    $c0 = $img.GetPixel(0, 0)
    $cMid = $img.GetPixel(512, 512)
    Write-Host "$f.png -> Corner Alpha: $($c0.A), Center Alpha: $($cMid.A)"
    $img.Dispose()
}
