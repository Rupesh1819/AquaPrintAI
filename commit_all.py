import subprocess
import os

def run_cmd(cmd):
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    return result.stdout.strip(), result.stderr.strip()

out, err = run_cmd('git status --porcelain')
lines = out.split('\n')

for line in lines:
    line = line.strip()
    if not line:
        continue
    
    file_path = line[3:]
    # Strip quotes if any
    if file_path.startswith('"') and file_path.endswith('"'):
        file_path = file_path[1:-1]
        
    file_name = os.path.basename(file_path)
    
    status_code = line[:2]
    if 'D' in status_code:
        action = 'Remove'
    elif '?' in status_code:
        action = 'Add'
    else:
        action = 'Update'
        
    print(f'Processing {file_path} ({action})')
    
    run_cmd(f'git add "{file_path}"')
    
    msg = f'{action} {file_name}'
    # Double quotes around message might cause issues in shell=True if not escaped properly
    # Using a list is safer for subprocess but since we have shell=True, let's use list without shell=True
    subprocess.run(["git", "commit", "-m", msg], capture_output=True)

print('Pushing to github...')
push_result = subprocess.run(["git", "push"], capture_output=True, text=True)
print(push_result.stdout)
if push_result.stderr:
    print('Error/Warning from push:', push_result.stderr)
else:
    print('Pushed successfully.')
