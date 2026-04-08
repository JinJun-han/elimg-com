$dir = 'C:\Users\kodhj\elimg-com'

$fixes = @{
    'HanwhaOcean_Level1_Lesson8.html'  = @("eng:'It's slippery because it's raining.'", "eng:""It's slippery because it's raining.""")
    'HanwhaOcean_Level1_Lesson9.html'  = @("eng:'I have a fever so I'm going to the hospital.'", "eng:""I have a fever so I'm going to the hospital.""")
    'HanwhaOcean_Level1_Lesson10.html' = @("eng:'I'm working right now.'", "eng:""I'm working right now.""")
    'HanwhaOcean_Level1_Lesson15.html' = @("eng:'Let's definitely go together next time.'", "eng:""Let's definitely go together next time.""")
    'HanwhaOcean_Level1_Lesson16.html' = @("eng:'I'm sleeping right now.'", "eng:""I'm sleeping right now.""")
    'HanwhaOcean_Level1_Lesson20.html' = @("eng:'I'm planning to get a certification this year.'", "eng:""I'm planning to get a certification this year.""")
}

foreach ($filename in $fixes.Keys) {
    $path = Join-Path $dir $filename
    $content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)
    $old = $fixes[$filename][0]
    $new = $fixes[$filename][1]
    if ($content.Contains($old)) {
        $content = $content.Replace($old, $new)
        [System.IO.File]::WriteAllText($path, $content, [System.Text.Encoding]::UTF8)
        Write-Output "Fixed: $filename"
    } else {
        Write-Output "NOT FOUND: $filename"
    }
}
