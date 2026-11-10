$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0

try {
  $path = "E:\next.js project sem 5\Club.ing_Project_Report_INT257_Ashish_Shankar.docx"
  $doc = $word.Documents.Open($path)
  $pages = $doc.ComputeStatistics(2)
  Write-Host "WORD VERIFICATION SUCCESS: Document opened with ZERO errors! Page count: $pages"
  $doc.Saved = $true
  $doc.Close(0)
} catch {
  Write-Host "VERIFICATION FAILED: $($_.Exception.Message)"
} finally {
  [System.Runtime.Interopservices.Marshal]::ReleaseComObject($word) | Out-Null
  Stop-Process -Name "WINWORD" -Force -ErrorAction SilentlyContinue
}
