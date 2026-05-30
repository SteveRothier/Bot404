' Lance la génération NPC sans fenêtre (pour le Planificateur de tâches Windows).
' Usage: wscript.exe run-npc.vbs [posts|comments|both]

Option Explicit

Dim mode, fso, shell, scriptDir, projectRoot, nodeExe, logDir, logFile, args, cmd

If WScript.Arguments.Count > 0 Then
  mode = LCase(WScript.Arguments(0))
Else
  mode = "both"
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
On Error Resume Next
If fso.FileExists(projectRoot & "\.env.local") Then
  ' rien — le script Node charge .env.local
End If
On Error GoTo 0

Select Case mode
  Case "posts"
    logFile = logDir & "\npc-posts.log"
    args = "scripts\npc-generate-local.mjs --posts"
  Case "comments"
    logFile = logDir & "\npc-comments.log"
    args = "scripts\npc-generate-local.mjs --comments"
  Case Else
    logFile = logDir & "\npc-generate.log"
    args = "scripts\npc-generate-local.mjs"
End Select

cmd = "cmd /c echo [" & Now & "] START " & mode & ">> """ & logFile & """ && " & _
      nodeExe & " " & args & " >> """ & logFile & """ 2>&1"

' 0 = fenêtre masquée
shell.Run cmd, 0, False
