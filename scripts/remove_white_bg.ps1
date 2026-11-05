Add-Type -AssemblyName System.Drawing

function Convert-WhiteToTransparent {
    param(
        [string]$inputPath,
        [string]$outputPath
    )
    
    $src = [System.Drawing.Bitmap]::new($inputPath)
    $dest = New-Object System.Drawing.Bitmap($src.Width, $src.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    
    $rect = New-Object System.Drawing.Rectangle(0, 0, $src.Width, $src.Height)
    $srcData = $src.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $destData = $dest.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::WriteOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    
    $bytes = $src.Width * $src.Height * 4
    $srcBytes = New-Object byte[] $bytes
    $destBytes = New-Object byte[] $bytes
    
    [System.Runtime.InteropServices.Marshal]::Copy($srcData.Scan0, $srcBytes, 0, $bytes)
    
    # Thresholds: Anything >= 240 is 100% transparent. Between 215 and 240 is feathered.
    for ($i = 0; $i -lt $bytes; $i += 4) {
        $b = [int]$srcBytes[$i]
        $g = [int]$srcBytes[$i + 1]
        $r = [int]$srcBytes[$i + 2]
        
        $minVal = [Math]::Min($r, [Math]::Min($g, $b))
        
        if ($minVal -ge 240) {
            $destBytes[$i] = 0
            $destBytes[$i + 1] = 0
            $destBytes[$i + 2] = 0
            $destBytes[$i + 3] = 0
        } elseif ($minVal -ge 215) {
            $alpha = [int]((240 - $minVal) / 25.0 * 255)
            $destBytes[$i] = $b
            $destBytes[$i + 1] = $g
            $destBytes[$i + 2] = $r
            $destBytes[$i + 3] = [Math]::Max(0, [Math]::Min(255, $alpha))
        } else {
            $destBytes[$i] = $b
            $destBytes[$i + 1] = $g
            $destBytes[$i + 2] = $r
            $destBytes[$i + 3] = 255
        }
    }
    
    [System.Runtime.InteropServices.Marshal]::Copy($destBytes, 0, $destData.Scan0, $bytes)
    
    $src.UnlockBits($srcData)
    $dest.UnlockBits($destData)
    $src.Dispose()
    
    $dest.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $dest.Dispose()
    Write-Host "Perfect PNG: $outputPath"
}

$files = @("pocket-card", "daily-limit", "bill-guard", "goal-ring", "coins-star")
foreach ($f in $files) {
    $in = "public\welcome\$f.jpg"
    $out = "public\welcome\$f.png"
    if (Test-Path $in) {
        Convert-WhiteToTransparent $in $out
    }
}
