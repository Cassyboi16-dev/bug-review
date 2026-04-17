# Language Installation Guide for Windows

Follow these steps to install each language. After installation, verify by opening PowerShell and running the verification commands.

---

## 1. Python 3
**Download**: https://www.python.org/downloads/
- Download the latest Python 3.x
- **IMPORTANT**: Check "Add Python to PATH" during installation
- **Verify**: Open PowerShell and run: `python --version`

---

## 2. Java (JDK)
**Download**: https://www.oracle.com/java/technologies/downloads/
- Download JDK 17 or newer (LTS version recommended)
- Run installer and complete installation
- **Verify**: Open PowerShell and run: `java -version`

---

## 3. C++ Compiler (MinGW)
**Option A - MinGW (Recommended)**:
**Download**: https://www.mingw-w64.org/downloads/
- Download the online installer
- Install to `C:\mingw64`
- Add to PATH: `C:\mingw64\bin`
- **Verify**: Open PowerShell and run: `g++ --version`

**Option B - Visual Studio Build Tools**:
**Download**: https://visualstudio.microsoft.com/downloads/
- Download "Build Tools for Visual Studio"
- Select "Desktop development with C++"
- **Verify**: Open PowerShell and run: `cl.exe` (should show Microsoft C++ compiler info)

---

## 4. Ruby
**Download**: https://rubyinstaller.org/downloads/
- Download Ruby+Devkit (latest version)
- **IMPORTANT**: Check "Add Ruby executables to your PATH"
- Complete the installation
- **Verify**: Open PowerShell and run: `ruby --version`

---

## 5. Go
**Download**: https://golang.org/dl/
- Download Windows installer
- Run and complete installation
- **Verify**: Open PowerShell and run: `go version`

---

## 6. PHP
**Download**: https://www.php.net/downloads
- Download Windows "Non Thread Safe" zip
- Extract to `C:\php` (or any location without spaces)
- Add to PATH: `C:\php`
- **Verify**: Open PowerShell and run: `php --version`

---

## 7. Lua
**Download**: https://github.com/rjpcomputing/luaforwindows/releases
- Download the latest release
- Run installer and complete installation
- **Verify**: Open PowerShell and run: `lua -v`

---

## 8. C# (Optional - comes with .NET)
**Download**: https://dotnet.microsoft.com/download
- Download .NET SDK
- Run installer
- **Verify**: Open PowerShell and run: `dotnet --version`

---

## Adding to PATH (If needed)

1. Press `Win + X` → Select "System"
2. Click "Advanced system settings"
3. Click "Environment Variables"
4. Under "System variables", click "Path" then "Edit"
5. Click "New" and add the path to each language's bin folder:
   - Python: `C:\Users\YourUsername\AppData\Local\Programs\Python\Python312`
   - Java: `C:\Program Files\Java\jdk-17\bin`
   - MinGW: `C:\mingw64\bin`
   - Ruby: `C:\Ruby32\bin`
   - Go: `C:\Program Files\Go\bin`
   - PHP: `C:\php`
   - Lua: `C:\Program Files (x86)\Lua\5.3`

6. Click OK and restart PowerShell to apply changes

---

## Verification Script

After installing, run this in PowerShell to verify everything:

```powershell
Write-Host "Checking installed languages..."
Write-Host "Python: $(python --version 2>&1)"
Write-Host "Java: $(java -version 2>&1 | Select-Object -First 1)"
Write-Host "C++: $(g++ --version 2>&1 | Select-Object -First 1)"
Write-Host "Ruby: $(ruby --version 2>&1)"
Write-Host "Go: $(go version 2>&1)"
Write-Host "PHP: $(php --version 2>&1 | Select-Object -First 1)"
Write-Host "Lua: $(lua -v 2>&1)"
```

---

## Next Steps

Once you've installed the languages:
1. Restart your development server
2. The code tester will automatically use the local installations
3. Test each language with the examples provided

**Note**: For C/C++, you may need to create temporary files. This is handled automatically by the backend.

