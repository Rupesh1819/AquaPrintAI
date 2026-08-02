git reset
$status = git status --porcelain
foreach ($line in $status) {
    if ([string]::IsNullOrWhiteSpace($line)) { continue }
    $actionCode = $line.Substring(0, 2)
    $filePath = $line.Substring(3).Trim('"')
    $fileName = Split-Path $filePath -Leaf
    
    $action = "Update"
    if ($actionCode -match 'D') { $action = "Remove" }
    elseif ($actionCode -match '\?') { $action = "Add" }
    
    Write-Host "Processing $filePath ($action)"
    
    if ($actionCode -match 'D') {
        git rm $filePath
    } else {
        git add $filePath
    }
    
    git commit --no-verify -m "$action $fileName"
}
git push
