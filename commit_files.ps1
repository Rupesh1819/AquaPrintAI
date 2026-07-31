$ErrorActionPreference = 'Continue'

git remote add origin https://github.com/Rupesh1819/AquaPrintAI.git 2>$null
git branch -M main

$lines = git status --porcelain -uall
foreach ($line in $lines) {
    if ([string]::IsNullOrWhiteSpace($line)) { continue }
    
    $action = $line.Substring(0,2)
    $file = $line.Substring(3).Trim('"')
    
    if ($action -match "D") {
        git rm $file
        git commit --no-verify -m "Delete $file"
    } else {
        git add $file
        git commit --no-verify -m "Update $file"
    }
}

git push -u origin main
