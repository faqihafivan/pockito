Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::new("public\welcome\pocket-card.png")
$c0 = $img.GetPixel(0, 0)
$c1 = $img.GetPixel(5, 5)
Write-Host "PNG Pixel 0,0: Alpha=$($c0.A), R=$($c0.R), G=$($c0.G), B=$($c0.B)"
Write-Host "PNG Pixel 5,5: Alpha=$($c1.A), R=$($c1.R), G=$($c1.G), B=$($c1.B)"
$img.Dispose()
