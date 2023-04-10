!macro customInstall
  WriteRegStr HKCU "Software\Classes\Directory\Background\shell\Hyper" "" "Open &Hyper here"
  WriteRegStr HKCU "Software\Classes\Directory\Background\shell\Hyper" "Icon" "$appExe"
  WriteRegStr HKCU "Software\Classes\Directory\Background\shell\Hyper\command" "" `$appExe "%V"`

  WriteRegStr HKCU "Software\Classes\Directory\shell\Hyper" "" "Open &Hyper here"
  WriteRegStr HKCU "Software\Classes\Directory\shell\Hyper" "Icon" "$appExe"
  WriteRegStr HKCU "Software\Classes\Directory\shell\Hyper\command" "" `$appExe "%V"`

  WriteRegStr HKCU "Software\Classes\Drive\shell\Hyper" "" "Open &Hyper here"
  WriteRegStr HKCU "Software\Classes\Drive\shell\Hyper" "Icon" "$appExe"
  WriteRegStr HKCU "Software\Classes\Drive\shell\Hyper\command" "" `$appExe "%V"`
!macroend

!macro customUnInstall
  DeleteRegKey HKCU "Software\Classes\Directory\Background\shell\Hyper"
  DeleteRegKey HKCU "Software\Classes\Directory\shell\Hyper"
  DeleteRegKey HKCU "Software\Classes\Drive\shell\Hyper"
!macroend

!macro customInstallMode
  StrCpy $isForceCurrentInstall "1"
!macroend

!macro customInit
  IfFileExists $LOCALAPPDATA\Hyper\Update.exe 0 +2
  nsExec::Exec '"$LOCALAPPDATA\Hyper\Update.exe" --uninstall -s'
!macroend
