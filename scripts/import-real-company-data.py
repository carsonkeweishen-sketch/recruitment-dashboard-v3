#!/usr/bin/env python3
"""Phase 8.12B: Import JD library — correct column names"""
import re, uuid, subprocess, json, openpyxl

def sql(cmd):
    r = subprocess.run(
        ['psql', '-h', 'localhost', '-U', 'postgres', '-d', 'recruitment_dashboard_v3', '-c', cmd],
        capture_output=True, text=True, timeout=10,
        env={**__import__('os').environ, 'PGPASSWORD': 'postgres'}
    )
    return r.returncode == 0

def import_jd():
    wb = openpyxl.load_workbook("/root/uploads/1782366823639658589-理然JD库.xlsx")
    ws = wb["Sheet1"]
    imported = 0
    
    for row in ws.iter_rows(min_row=2, values_only=True):
        seq, dept, title, level, jd_text, source_id = row
        if not title or not str(title).strip():
            continue
        title = str(title).strip().replace("'", "''")
        dept_name = str(dept).strip() if dept else "未分类"
        jd_text = (str(jd_text) or "").strip().replace("'", "''")
        level_str = str(level).strip() if level else "S2"
        
        dept_code = re.sub(r'[^A-Za-z]', '', dept_name)[:10].upper() or "OTHER"
        dept_id = str(uuid.uuid4())[:25]
        job_id = str(uuid.uuid4())[:25]
        job_code = f"RL-{dept_code}-{seq}"
        
        # Upsert department (snake_case columns)
        sql(f"""INSERT INTO departments (id, name, code, created_at, updated_at)
            VALUES ('{dept_id}', '{dept_name}', '{dept_code}', NOW(), NOW())
            ON CONFLICT (code) DO UPDATE SET name=EXCLUDED.name""")
        
        # Get actual dept id  
        r = subprocess.run(
            ['psql', '-h', 'localhost', '-U', 'postgres', '-d', 'recruitment_dashboard_v3', '-t', '-c',
             f"SELECT id FROM departments WHERE code = '{dept_code}'"],
            capture_output=True, text=True, timeout=5,
            env={**__import__('os').environ, 'PGPASSWORD': 'postgres'}
        )
        actual_dept_id = r.stdout.strip()
        if not actual_dept_id:
            continue
        
        jd_summary = jd_text[:500].replace("'", "''")
        
        # INSERT job — use snake_case column names from psql \d
        ok = sql(f"""INSERT INTO jobs (id, job_code, title, "departmentId", level, status, priority, headcount,
            "jdText", "profileSummary", source_file, source_sheet, source_row, "ownerId", created_at, updated_at)
            VALUES ('{job_id}', '{job_code}', '{title}', '{actual_dept_id}', '{level_str}', 'open', 'medium', 1,
            '{jd_text}', '{jd_summary}', '理然JD库.xlsx', 'Sheet1', '{seq}', 'user-admin', NOW(), NOW())""")
        
        if ok:
            imported += 1
        elif imported == 0:
            # Print first error for debugging
            r2 = subprocess.run(
                ['psql', '-h', 'localhost', '-U', 'postgres', '-d', 'recruitment_dashboard_v3', '-c',
                 f"INSERT INTO jobs (id, job_code, title, \"departmentId\", level, status, priority, headcount, \"jdText\", \"profileSummary\", source_file, source_sheet, source_row, \"ownerId\", created_at, updated_at) VALUES ('{job_id}', '{job_code}', '{title}', '{actual_dept_id}', '{level_str}', 'open', 'medium', 1, 'x', 'x', 'x', 'x', '1', 'user-admin', NOW(), NOW())"],
                capture_output=True, text=True, timeout=5,
                env={**__import__('os').environ, 'PGPASSWORD': 'postgres'}
            )
            print(f"  SQL ERROR: {r2.stderr[:300]}")
        
        if imported % 20 == 0 and imported > 0:
            print(f"  Imported {imported} jobs...")
    
    print(f"✅ Imported {imported} real jobs from 理然JD库.xlsx")
    return imported

if __name__ == "__main__":
    print("=" * 60)
    print("Phase 8.12B: Real Company Data Import")
    print("=" * 60)
    import_jd()
    
    # Verify
    r = subprocess.run(
        ['psql', '-h', 'localhost', '-U', 'postgres', '-d', 'recruitment_dashboard_v3', '-t', '-c',
         "SELECT count(*) FROM jobs WHERE source_file IS NOT NULL"],
        capture_output=True, text=True, timeout=5,
        env={**__import__('os').environ, 'PGPASSWORD': 'postgres'}
    )
    print(f"Verified: {r.stdout.strip()} jobs with source_file")
