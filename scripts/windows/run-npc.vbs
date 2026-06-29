' Lance la génération NPC sans fenêtre (pour le Planificateur de tâches Windows).
' Usage: wscript.exe run-npc.vbs [posts|comments|both|tick] [count]

Option Explicit

Dim mode, countArg, fso, shell, scriptDir, projectRoot, nodeExe, logDir, logFile, args, cmd

If WScript.Arguments.Count > 0 Then
  mode = LCase(WScript.Arguments(0))
Else
  mode = "both"
End If

If WScript.Arguments.Count > 1 Then
  countArg = WScript.Arguments(1)
Else
  countArg = ""
End If

Set fso = CreateObject("Scripting.FileSystemObject")
Set shell = CreateObject("WScript.Shell")

scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
projectRoot = fso.GetParentFolderName(fso.GetParentFolderName(scriptDir))

shell.CurrentDirectory = projectRoot

logDir = projectRoot & "\logs"
If Not fso.FolderExists(logDir) Then
  fso.CreateFolder logDir
End If

nodeExe = "node"

Select Case mode
  Case "posts"
    logFile = logDir & "\npc-posts.log"
    args = "scripts\npc-schedule-run.mjs posts"
    If countArg <> "" Then args = args & " " & countArg
  Case "comments"
    logFile = logDir & "\npc-comments.log"
    args = "scripts\npc-schedule-run.mjs comments"
    If countArg <> "" Then args = args & " " & countArg
  Case "tick"
    logFile = logDir & "\narrative-tick.log"
    cmd = "cmd /c echo [" & Now & "] START tick>> """ & logFile & """ && " & _
          nodeExe & " scripts\npc-schedule-run.mjs tick >> """ & logFile & """ 2>&1"
    shell.Run cmd, 0, False
    WScript.Quit 0
  Case Else
    logFile = logDir & "\npc-generate.log"
    args = "scripts\npc-schedule-run.mjs both"
End Select

cmd = "cmd /c echo [" & Now & "] START " & mode & ">> """ & logFile & """ && " & _
      nodeExe & " " & args & " >> """ & logFile & """ 2>&1"

' 0 = fenêtre masquée
shell.Run cmd, 0, False
