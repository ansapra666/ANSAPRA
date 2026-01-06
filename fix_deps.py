# fix_deps.py
import subprocess
import sys

def fix_dependencies():
    """修复依赖问题"""
    commands = [
        [sys.executable, "-m", "pip", "uninstall", "-y", "setuptools"],
        [sys.executable, "-m", "pip", "install", "setuptools==80.0.0"],
        [sys.executable, "-m", "pip", "install", "--upgrade", "pip"],
        [sys.executable, "-m", "pip", "install", "-r", "requirements.txt"],
    ]
    
    for cmd in commands:
        print(f"运行: {' '.join(cmd)}")
        try:
            subprocess.run(cmd, check=True)
        except subprocess.CalledProcessError as e:
            print(f"命令失败: {e}")
            return False
    
    print("依赖修复完成！")
    return True

if __name__ == "__main__":
    fix_dependencies()
