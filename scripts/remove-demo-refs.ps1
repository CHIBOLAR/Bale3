# PowerShell script to remove demo references from TypeScript files

$files = @(
    "app\dashboard\products\page.tsx",
    "app\dashboard\job-works\actions.ts",
    "app\dashboard\job-works\[id]\page.tsx",
    "app\dashboard\inventory\page.tsx",
    "app\dashboard\products\actions.ts",
    "app\dashboard\page.tsx",
    "app\dashboard\overview\page.tsx",
    "app\dashboard\staff\page.tsx",
    "app\dashboard\staff\[id]\page.tsx",
    "app\dashboard\sales-orders\[id]\page.tsx",
    "app\dashboard\staff\actions.ts",
    "app\api\admin\create-staff-invite\route.ts",
    "app\dashboard\staff\add\page.tsx",
    "app\dashboard\staff\StaffClient.tsx",
    "app\dashboard\staff\[id]\StaffDetailClient.tsx",
    "app\dashboard\sales-orders\page.tsx",
    "app\dashboard\sales-orders\new\page.tsx",
    "app\dashboard\partners\[id]\page.tsx",
    "app\dashboard\partners\add\page.tsx",
    "app\dashboard\partners\page.tsx",
    "app\dashboard\products\[id]\edit\page.tsx",
    "app\dashboard\products\[id]\page.tsx",
    "app\dashboard\products\add\page.tsx"
)

foreach ($file in $files) {
    $path = "C:\Users\Chirag\Bale Inventorye\$file"
    if (Test-Path $path) {
        $content = Get-Content $path -Raw

        # Remove is_demo from select statements
        $content = $content -replace ", is_demo", ""
        $content = $content -replace "is_demo, ", ""
        $content = $content -replace "is_demo:", ""

        # Remove demo checks in conditions
        $content = $content -replace " \|\| userData\.is_demo", ""
        $content = $content -replace " \|\| adminUser\.is_demo", ""
        $content = $content -replace " \&\& !userData\.is_demo", ""
        $content = $content -replace "!userData\.is_demo", "true"
        $content = $content -replace "userData\.is_demo", "false"

        # Remove demo-related comments
        $content = $content -replace "\/\/ Check if user is demo.*\n", ""

        # Remove .eq('is_demo', true) lines
        $content = $content -replace "\s+\.eq\('is_demo', true\)\n", "`n"

        # Remove isDemo props
        $content = $content -replace "\s+is_demo: boolean", ""
        $content = $content -replace "\s+isDemo=\{[^\}]+\}", ""
        $content = $content -replace "\s+canEdit=\{![^\}]+is_demo\}", " canEdit={true}"

        Set-Content $path $content -NoNewline
        Write-Host "Processed: $file"
    }
}

Write-Host "`nDemo references removed from all files!"
