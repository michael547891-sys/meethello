Add-Type -AssemblyName System.Drawing
function MidSpan([string]$path, [string]$label) {
  $img = [System.Drawing.Bitmap]::FromFile($path)
  $w=$img.Width; $h=$img.Height
  Write-Host "==== $label ${w}x${h} ===="
  $y=[int]($h*0.32)
  $lo=-1;$hi=-1
  for ($x=0; $x -lt $w; $x++) {
    $c=$img.GetPixel($x,$y)
    if ($c.R -lt 70 -and $c.G -lt 70 -and $c.B -lt 80) { if ($lo -lt 0){$lo=$x}; $hi=$x }
  }
  $cx=[int](($lo+$hi)/2)
  $top=-1;$bot=-1
  for ($yy=0; $yy -lt $h; $yy++) {
    $c=$img.GetPixel($cx,$yy)
    if ($c.R -lt 70 -and $c.G -lt 70 -and $c.B -lt 80) { if ($top -lt 0){$top=$yy}; $bot=$yy }
  }
  $pw=$hi-$lo+1; $ph=$bot-$top+1
  Write-Host ("  midY={0} preview w={1} h={2} left={3} right={4} top={5}" -f $y,$pw,$ph,$lo,($w-1-$hi),$top)
  Write-Host ("  h/w={0:N3} width%={1:N1} height%={2:N1}" -f ($ph/[double]$pw),(100*$pw/[double]$w),(100*$ph/[double]$h))
  # scale to 400 css if image ~400 device
  $scale = 400.0 / $w
  Write-Host ("  @400css => w={0:N0} h={1:N0} padL={2:N0}" -f ($pw*$scale),($ph*$scale),($lo*$scale))
  $img.Dispose()
}
MidSpan 'C:\Users\1\.cursor\projects\c-Users-1-Desktop-meet-prejoin\assets\image-03368a03-a455-4659-b804-05746143f4bc.png' 'SAMPLE'
MidSpan 'C:\Users\1\.cursor\projects\c-Users-1-Desktop-meet-prejoin\assets\image-8e9e8c11-4781-4500-8469-3530c4dc7fce.png' 'SAMPLE2'
MidSpan 'C:\Users\1\.cursor\projects\c-Users-1-Desktop-meet-prejoin\assets\image-55df6b67-8398-4769-b809-f1aeda094e10.png' 'CAM'
MidSpan 'C:\Users\1\.cursor\projects\c-Users-1-Desktop-meet-prejoin\assets\image-509ba9c6-73bb-45fd-9ced-8d528cb4992d.png' 'SAMPLE400'
