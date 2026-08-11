Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "D:\UsersData\Eliseo Miraglia\Desktop\ELISEE SCOUT SITO"
WshShell.Run """C:\Users\Eliseo Miraglia\AppData\Local\Programs\Python\Python312-embed\python.exe"" -u _launch_breakaway.py", 0, False