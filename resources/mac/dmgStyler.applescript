set appName to (system attribute "APP_NAME")
tell application "Finder"
  tell disk appName
    open
    set current view of container window to icon view
    set toolbar visible of container window to false
    set statusbar visible of container window to false
    set the bounds of container window to {100, 100, 640, 250}
    set theViewOptions to the icon view options of container window
    set arrangement of theViewOptions to not arranged
    set icon size of theViewOptions to 64
    set background picture of theViewOptions to POSIX file ("/Volumes/" & appName & "/.background/background.png")
    set position of item (appName & ".app") of container window to {225, 40}
    set position of item "Applications" of container window to {375, 40}
    set position of item ".DS_Store" of container window to {400, 400}
    set position of item ".Trashes" of container window to {400, 400}
    set position of item ".fseventsd" of container window to {400, 400}
    set position of item ".background" of container window to {400, 400}
    update without registering applications
    close
  end tell
end tell
