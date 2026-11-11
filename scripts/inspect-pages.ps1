$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0

try {
  $doc = $word.Documents.Open('E:\next.js project sem 5\ClubPulse_Project_Report_INT257_Ashish_Shankar.docx')
  $pageCount = $doc.ComputeStatistics(2)
  Write-Host "Total Pages: $pageCount"
  
  for ($i = 1; $i -le $pageCount; $i++) {
    $rStart = $doc.GoTo(1, 1, $i)
    if ($i -lt $pageCount) {
      $rEnd = $doc.GoTo(1, 1, $i + 1)
      $rStart.End = $rEnd.Start
    } else {
      $rStart.End = $doc.Content.End
    }
    $text = $rStart.Text.Trim().Replace("`r", " ").Replace("`n", " ")
    if ($text.Length -gt 70) {
      $text = $text.Substring(0, 70) + "..."
    }
    Write-Host "Page $i : $text"
  }
  $doc.Saved = $true
  $doc.Close(0)
} finally {
  $word.Quit()
  [System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null
  Stop-Process -Name "WINWORD" -Force -ErrorAction SilentlyContinue
}

