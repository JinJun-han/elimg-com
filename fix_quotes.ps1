$dir = 'C:\Users\kodhj\elimg-com'

# Map: filename -> (old string, new string)
$fixes = @{
    'HanwhaOcean_Level1_Lesson5.html'  = @("eng:'It's 3,000 won.'",       "eng:""It's 3,000 won.""")
    'HanwhaOcean_Level1_Lesson6.html'  = @("eng:'What is today's menu?'", "eng:""What is today's menu?""")
    'HanwhaOcean_Level1_Lesson7.html'  = @("eng:'Let's watch a movie together.'", "eng:""Let's watch a movie together.""")
    'HanwhaOcean_Level1_Lesson8.html'  = @("eng:'It's very hot. Please be careful.'", "eng:""It's very hot. Please be careful.""")
    'HanwhaOcean_Level1_Lesson9.html'  = @("eng:'I'm dizzy so I need to rest.'", "eng:""I'm dizzy so I need to rest.""")
    'HanwhaOcean_Level1_Lesson10.html' = @("eng:'It's 010-1234-5678.'", "eng:""It's 010-1234-5678.""")
    'HanwhaOcean_Level1_Lesson13.html' = @("eng:'It's 20 minutes by bus.'", "eng:""It's 20 minutes by bus.""")
    'HanwhaOcean_Level1_Lesson15.html' = @("eng:'Let's meet at 6 PM in front of the main gate.'", "eng:""Let's meet at 6 PM in front of the main gate.""")
    'HanwhaOcean_Level1_Lesson16.html' = @("eng:'There's no hot water.'", "eng:""There's no hot water.""")
    'HanwhaOcean_Level1_Lesson19.html' = @("eng:'Please help me. I don't understand.'", "eng:""Please help me. I don't understand.""")
    'HanwhaOcean_Level1_Lesson20.html' = @("eng:'I'm studying to get better at Korean.'", "eng:""I'm studying to get better at Korean.""")
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
        Write-Output "NOT FOUND: $filename -> '$old'"
    }
}
