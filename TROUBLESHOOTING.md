# 🔧 Code Tester - Troubleshooting Guide

## Common Issues & Solutions

### 1. **JavaScript Runs Instantly But Other Languages Are Slow**

**Why:** This is normal and expected!

- ✅ **JavaScript:** Runs in your browser (<100ms)
- ✅ **Other languages:** Run via cloud service (1-3 seconds)

**This is a feature, not a bug!**

---

### 2. **"Execution timeout - code took too long"**

**What it means:** Your code is taking more than 15 seconds (or 30s for Go).

**Solutions:**
- Check for infinite loops (`while(true)`, etc.)
- Add `console.log()` or `print()` statements to debug
- Simplify your code
- Test smaller functions individually

**Example of infinite loop:**
```python
# DON'T DO THIS
while True:
    print("This never ends!")
```

**Fixed:**
```python
# DO THIS
for i in range(5):
    print(i)
```

---

### 3. **JavaScript Works But Other Languages Fail**

**Possible causes:**

1. **Syntax error in your code**
   - Check the error message carefully
   - Look for missing semicolons, parentheses, etc.

2. **Missing required import/package**
   - Make sure you have required imports at top
   - Example: `import java.util.*;` for Java

3. **Wrong code structure**
   - Java needs: `public class Main { ... }`
   - C needs: `#include <stdio.h>`
   - Go needs: `package main`

4. **Cloud service temporarily down**
   - Try JavaScript (works without cloud)
   - Try again in a few moments

---

### 4. **"Execution service temporarily unavailable"**

**What it means:** Judge0 and Piston APIs are temporarily down.

**Solutions:**
- ✅ JavaScript will still work instantly
- ⏱️ Try again in a few moments
- 🔄 Refresh the page and retry
- 💬 Test with a different language

---

### 5. **Java Code Shows "Class Main not found"**

**What it means:** Java expects public class name to match.

**Your code:**
```java
public class MyClass {
    public static void main(String[] args) {
        System.out.println("Hello!");
    }
}
```

**The fix - Use "Main" as class name:**
```java
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello!");
    }
}
```

**Or use template:** Click language button → template code loads with correct structure

---

### 6. **C/C++ Code Won't Compile**

**Common C++ errors:**

Error: `undefined reference to 'cout'`
```cpp
// Wrong - missing namespace
cout << "Hello";

// Correct
using namespace std;
cout << "Hello";
```

Error: `no match for operator<<`
```cpp
// Wrong
cout << variable + 1;  // Looks correct but...

// Check your #include
#include <iostream>  // ✅ This is needed
```

---

### 7. **Python Code Works at Home But Not Here**

**Possible cause:** Using unsupported libraries

```python
# ❌ WON'T WORK - needs external package
import numpy as np
result = np.array([1,2,3])

# ✅ WORKS - uses built-in library
data = [1, 2, 3]
result = sum(data)
```

**Supported libraries:** Only Python standard library. No pip packages.

---

### 8. **Go Code Fails**

**Most common issue:** Missing `package main`

```go
// ❌ WRONG
func main() {
    fmt.Println("Hello")
}

// ✅ CORRECT
package main
import "fmt"
func main() {
    fmt.Println("Hello")
}
```

---

### 9. **C# Code Shows Compiler Error**

**Common issue:** Wrong namespace

```csharp
// ❌ WRONG
class Program {
    static void Main() {
        Console.WriteLine("Hello");
    }
}

// ✅ CORRECT
using System;
class Program {
    static void Main() {
        Console.WriteLine("Hello");
    }
}
```

---

### 10. **Bash Code Not Running**

**On Windows:** Bash requires special setup

**Solutions:**
1. Use WSL (Windows Subsystem for Linux)
2. Install Git Bash
3. Use JavaScript instead

**Test:** Try Windows `echo` commands instead if WSL not available

---

### 11. **PHP Code Works Locally But Not Here**

**Reason:** PHP needs file I/O which isn't supported

```php
// ❌ WON'T WORK
$file = fopen("data.txt", "r");
$data = fread($file, filesize("data.txt"));

// ✅ WORKS
$data = "Hello World";
echo $data;
```

---

### 12. **Code Works in IDE But Fails Here**

**Common causes:**

1. **File I/O** - Can't read/write files
2. **External packages** - Only standard library supported
3. **Network requests** - Can't make HTTP calls
4. **GUI code** - Can't display windows

**Check:** Your code uses console input/output only? ✅ Should work!

---

### 13. **"No output" But Code Should Print**

**Possible issues:**

1. **Code doesn't print anything**
   ```python
   x = 5 + 3  # No output!
   print(x)   # This will output
   ```

2. **Print statement is wrong**
   ```python
   # ❌ Python
   printf("Hello");  # Wrong function
   
   # ✅ Python
   print("Hello")
   ```

3. **Wrong language selected**
   - Make sure you selected right language before running

---

## 🚀 Quick Diagnosis

### Test with Simple Code First

**JavaScript:**
```javascript
console.log("JavaScript works!");
```

**Python:**
```python
print("Python works!")
```

**Java:**
```java
public class Main {
    public static void main(String[] args) {
        System.out.println("Java works!");
    }
}
```

**C++:**
```cpp
#include <iostream>
using namespace std;
int main() {
    cout << "C++ works!" << endl;
    return 0;
}
```

All should print output. If any fail, check:
1. Syntax correct? (Use error message)
2. Selected right language?
3. Click Execute? (Check button)

---

## 📝 Debugging Tips

### 1. Add Output Statements
```python
# Before the line that might fail
print("About to do something")
result = risky_operation()
print("Operation complete")
```

### 2. Test Parts Separately
```java
// Test each method independently
public class Main {
    static void test1() { System.out.println("Test 1"); }
    static void test2() { System.out.println("Test 2"); }
    
    public static void main(String[] args) {
        test1();
        test2();
    }
}
```

### 3. Start Simple
```python
# Start here
x = 1
print(x)

# Add complexity gradually
x = 1 + 2
print(x)

# Then full code
result = complex_calculation()
print(result)
```

---

## ⚠️ Known Limitations

❌ **Cannot do:**
- File I/O (read/write files)
- Network requests (HTTP, sockets)
- System commands (except bash/shell)
- GUI applications
- Graphics
- External packages/libraries
- Database connections

✅ **Can do:**
- Console input/output
- Math calculations
- String manipulation
- Data structures
- Algorithms
- Standard library functions
- Simple programs

---

## 🎯 Error Message Reading Guide

### Look for patterns:

**"Syntax Error"**
- Missing `;` or `)`
- Unmatched braces

**"undefined/not defined"**
- Variable declared wrong
- Typo in variable name

**"Type Error"**
- Using wrong data type
- Example: `"5" + 3` vs `5 + 3`

**"cannot find symbol"** (Java)
- Import missing
- Class name wrong
- Variable not declared

---

## 💡 Pro Tips

1. **Use the templates** - Each language has working "Hello World" example
2. **Read error messages carefully** - They usually tell you exactly what's wrong
3. **Test incrementally** - Add lines one by one
4. **Google error messages** - Usually well-documented online
5. **Use smaller functions** - Debug one piece at a time

---

## 🆘 Still Not Working?

**Check:**
1. ✅ Syntax is correct (check error message)
2. ✅ Language is selected correctly
3. ✅ Code doesn't need external packages
4. ✅ Code doesn't do file I/O
5. ✅ Execution isn't timing out
6. ✅ You clicked "Execute" button

**If still stuck:**
- Read the full error message
- Try with JavaScript first
- Test with simpler code
- Use print statements to debug

---

## 🔗 Resources

- **JavaScript:** [MDN Docs](https://developer.mozilla.org)
- **Python:** [Python Docs](https://docs.python.org)
- **Java:** [Oracle Docs](https://docs.oracle.com/javase)
- **C++:** [CPPReference](https://en.cppreference.com)
- **Go:** [Go Docs](https://golang.org/doc)


