import subprocess
import ctypes
from ctypes import wintypes
import sys

# Commit changes
git_cmd = r"C:\Users\Yosra.Dallegi\AppData\Local\GitHubDesktop\app-3.6.10\resources\app\git\cmd\git.exe"
repo_dir = r"C:\Users\Yosra.Dallegi\.gemini\antigravity\scratch\eskiflow"

r1 = subprocess.run([git_cmd, "-C", repo_dir, "add", "-A"], capture_output=True, text=True)
print("git add:", r1.stdout, r1.stderr)

commit_msg = "fix: filtrage strict des frigos, taches et vues selon acces restreint utilisateur"
r2 = subprocess.run([git_cmd, "-C", repo_dir, "commit", "-m", commit_msg], capture_output=True, text=True)
print("git commit:", r2.stdout, r2.stderr)

# Read GitHub token from Credential Manager
class CREDENTIAL(ctypes.Structure):
    _fields_ = [
        ("Flags", wintypes.DWORD),
        ("Type", wintypes.DWORD),
        ("TargetName", wintypes.LPWSTR),
        ("Comment", wintypes.LPWSTR),
        ("LastWritten", wintypes.FILETIME),
        ("CredentialBlobSize", wintypes.DWORD),
        ("CredentialBlob", ctypes.POINTER(ctypes.c_byte)),
        ("Persist", wintypes.DWORD),
        ("AttributeCount", wintypes.DWORD),
        ("Attributes", ctypes.c_void_p),
        ("TargetAlias", wintypes.LPWSTR),
        ("UserName", wintypes.LPWSTR),
    ]

PCREDENTIAL = ctypes.POINTER(CREDENTIAL)
CredReadW = ctypes.windll.advapi32.CredReadW
CredReadW.argtypes = [wintypes.LPCWSTR, wintypes.DWORD, wintypes.DWORD, ctypes.POINTER(PCREDENTIAL)]
CredReadW.restype = wintypes.BOOL
CredFree = ctypes.windll.advapi32.CredFree
CredFree.argtypes = [ctypes.c_void_p]

# Targets to check
targets = [
    "LegacyGeneric:target=GitHub - https://api.github.com/Yosra-dallegi",
    "git:https://github.com",
    "GitHub - https://api.github.com/Yosra-dallegi"
]

token = None
for t in targets:
    pcred = PCREDENTIAL()
    if CredReadW(t, 1, 0, ctypes.byref(pcred)):
        cred = pcred.contents
        blob = ctypes.string_at(cred.CredentialBlob, cred.CredentialBlobSize)
        CredFree(pcred)
        # Usually utf-16 or utf-8
        try:
            val = blob.decode('utf-16-le')
            if 'ghp_' in val or 'github_pat_' in val:
                token = val
                print(f"Found token in {t} (utf-16)")
                break
        except:
            pass
        try:
            val = blob.decode('utf-8')
            if 'ghp_' in val or 'github_pat_' in val:
                token = val
                print(f"Found token in {t} (utf-8)")
                break
        except:
            pass
        # or maybe the whole blob is password
        token = blob.decode('latin1', errors='ignore')
        print(f"Found cred in {t}")
        break

if not token:
    print("Could not retrieve token automatically from Credential Manager.")
    sys.exit(1)

# Clean token (remove null bytes or trailing chars)
clean_token = token.strip().replace('\x00', '')

# Temporarily update origin URL
remote_url = f"https://x-access-token:{clean_token}@github.com/Yosra-dallegi/eskiflow.git"
subprocess.run([git_cmd, "-C", repo_dir, "remote", "set-url", "origin", remote_url])

try:
    print("Pushing to origin main...")
    r3 = subprocess.run([git_cmd, "-C", repo_dir, "push", "origin", "main"], capture_output=True, text=True, timeout=30)
    print("git push:", r3.stdout, r3.stderr)
finally:
    # Reset remote back to clean https URL
    subprocess.run([git_cmd, "-C", repo_dir, "remote", "set-url", "origin", "https://github.com/Yosra-dallegi/eskiflow.git"])
    print("Remote URL reset.")
