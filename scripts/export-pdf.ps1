$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = [Microsoft.Office.Interop.Word.WdAlertLevel]::wdAlertsNone
$docPath = 'E:\next.js project sem 5\ClubPulse_Project_Report_INT257_Ashish_Shankar.docx'
$pdfPath = 'E:\next.js project sem 5\docs\ClubPulse_Report_Preview.pdf'

try {
  $doc = $word.Documents.Open($docPath, $false, $true) # read-only
  $pages = $doc.ComputeStatistics([Microsoft.Office.Interop.Word.WdStatistic]::wdStatisticPages)
  Write-Host "Total Pages: $pages"
  $doc.ExportAsFixedFormat($pdfPath, 17) # 17 = wdExportFormatPDF
  $doc.Close([Microsoft.Office.Interop.Word.WdSaveOptions]::wdDoNotSaveChanges)
  Write-Host "Exported to PDF successfully: $pdfPath"
} catch {
  Write-Error $_.Exception.Message
} finally {
  $word.Quit([Microsoft.Office.Interop.Word.WdSaveOptions]::wdDoNotSaveChanges)
  [System.Runtime.Interopservices.Marshal]::ReleaseComObject($word) | Out-Null
  Stop-Process -Name "WINWORD" -Force -ErrorAction SilentlyContinue
}

