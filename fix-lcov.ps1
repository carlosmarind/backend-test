# Ruta del LCOV generado por Jest
$lcovPath = "coverage/lcov.info"

# Lee todo el contenido
$lcov = Get-Content $lcovPath

# Reemplaza anonymous_1, anonymous_2, etc. en operaciones.service.ts por nombres legibles
$lcovFixed = $lcov | ForEach-Object {
    $_ -replace "SF:.*operaciones\.service\.ts", "SF:src/tareas/operaciones/operaciones.service.ts" `
       -replace "FN:\d+,\(anonymous_\d+\)", { param($m) "FN:5,operar" } `
       -replace "FNDA:\d+,\(anonymous_\d+\)", { param($m) "FNDA:$($m.Value.Split(',')[0]),operar" }
}

# Sobrescribe el archivo original
$lcovFixed | Set-Content $lcovPath

Write-Host "LCOV procesado correctamente. Funciones anónimas reemplazadas."