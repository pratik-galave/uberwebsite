Add-Type -AssemblyName System.Drawing
$imgPath = "C:\Users\user\.gemini\antigravity\brain\298956af-b3e8-41ff-991f-aa3eb583a3b7\media__1777116236970.png"
$img = [System.Drawing.Image]::FromFile($imgPath)
$bmp = new-object System.Drawing.Bitmap($img)

# We'll just save it as is first to see if it works. 
# But the user might want a tight crop.
# Actually, the user's previous feedback was about "zooming in", so a tight crop is essential.

# Tight crop logic: Find non-transparent pixels
$minX = $bmp.Width
$maxX = 0
$minY = $bmp.Height
$maxY = 0

for ($x = 0; $x -lt $bmp.Width; $x++) {
    for ($y = 0; $y -lt $bmp.Height; $y++) {
        $pixel = $bmp.GetPixel($x, $y)
        # Check if pixel is not part of a checkerboard or transparent
        # In a real transparent PNG, Alpha would be 0.
        # If it's a screenshot with checkerboard, we have a problem.
        # Let's assume it's a real PNG for now.
        if ($pixel.A -gt 0) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}

if ($maxX -gt $minX -and $maxY -gt $minY) {
    $rect = New-Object System.Drawing.Rectangle($minX, $minY, ($maxX - $minX + 1), ($maxY - $minY + 1))
    $tightBmp = $bmp.Clone($rect, $bmp.PixelFormat)
    $tightBmp.Save("C:\Users\user\Desktop\restart\uber\frontend\public\velocity_logo.png", [System.Drawing.Imaging.ImageFormat]::Png)
    $tightBmp.Dispose()
} else {
    # Fallback if no non-transparent pixels found (e.g. if it has a white background instead)
    $bmp.Save("C:\Users\user\Desktop\restart\uber\frontend\public\velocity_logo.png", [System.Drawing.Imaging.ImageFormat]::Png)
}

$bmp.Dispose()
$img.Dispose()
