$dir = 'C:\Users\kodhj\elimg-com'
$files = Get-ChildItem $dir -Filter 'HanwhaOcean_Level1_Lesson*.html' | Sort-Object Name
foreach ($f in $files) {
    $html = [System.IO.File]::ReadAllText($f.FullName, [System.Text.Encoding]::UTF8)
    $scriptStart = $html.IndexOf('<script>', $html.IndexOf('<body>')) + 8
    $scriptEnd = $html.IndexOf('</script>', $scriptStart)
    $script = $html.Substring($scriptStart, $scriptEnd - $scriptStart)
    $tmpFile = $dir + '\_tmp.js'
    [System.IO.File]::WriteAllText($tmpFile, $script, [System.Text.Encoding]::UTF8)
    $result = (node --check $tmpFile) 2>&1
    if ($result) {
        $match = [regex]::Match(($result -join ''), '_tmp\.js:(\d+)')
        $lineNum = if ($match.Success) { [int]$match.Groups[1].Value } else { 0 }
        $lines = $script -split "`n"
        if ($lineNum -gt 0 -and $lineNum -le $lines.Count) {
            $errorLine = $lines[$lineNum - 1].Trim()
        } else {
            $errorLine = 'unknown'
        }
        Write-Output "$($f.Name) [L$lineNum]: $errorLine"
    } else {
        Write-Output "$($f.Name): OK"
    }
}
