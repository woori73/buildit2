# -*- coding: utf-8 -*-
"""
HWPX HTTP 통합 테스트 (GitHub Actions / Linux)
"""
import json, sys, time, zipfile
import requests

BASE = "http://localhost:8080"
TEST_FILE = "hwpx-test/test.hwpx"
EDIT_TEXT = "통합테스트수정셀"

results = []
def check(name, ok, detail=""):
    results.append((name, ok, detail))
    print(f"[{'PASS' if ok else 'FAIL'}] {name}" + (f" - {detail}" if detail else ""), flush=True)

def login(session, login_id, password):
    r = session.post(f"{BASE}/api/auth/login", json={"loginId": login_id, "password": password})
    return r.status_code

s_admin = requests.Session()
t0 = time.time()
code = login(s_admin, "admin", "admin1234")
check("1. admin 로그인", code == 200, f"HTTP {code}, {time.time()-t0:.1f}s")

job_id = None
if code == 200:
    t0 = time.time()
    edits = {"title": "HWPX 통합테스트", "edits": [{"table": 0, "row": 0, "col": 0, "text": EDIT_TEXT}]}
    with open(TEST_FILE, "rb") as f:
        files = {
            "file": ("test.hwpx", f, "application/vnd.hancom.hwpx"),
            "edits": (None, json.dumps(edits, ensure_ascii=False), "application/json"),
        }
        data = {"title": "HWPX 통합테스트"}
        r = s_admin.post(f"{BASE}/api/hwpx/jobs", files=files, data=data)
    ok = r.status_code in (200, 201)
    if ok:
        try:
            job_id = r.json().get("id")
        except Exception:
            job_id = None
    check("2. 작업 생성 (업로드)", ok and job_id is not None, f"HTTP {r.status_code}, jobId={job_id}, {time.time()-t0:.1f}s")

seen = set()
final_status = None
if job_id:
    t0 = time.time()
    for _ in range(24):
        r = s_admin.get(f"{BASE}/api/hwpx/jobs/{job_id}")
        if r.status_code == 200:
            st = r.json().get("status")
            seen.add(st)
            if st in ("DONE", "FAILED", "CANCELLED"):
                final_status = st
                break
        time.sleep(5)
    elapsed = time.time() - t0
    check("3. 상태 전이 QUEUED→RUNNING→DONE", final_status == "DONE",
          f"관측: {sorted(seen)}, 최종: {final_status}, {elapsed:.1f}s")

result_path = "hwpx-test/result.hwpx"
if final_status == "DONE":
    t0 = time.time()
    r = s_admin.get(f"{BASE}/api/hwpx/jobs/{job_id}/download")
    dl_ok = r.status_code == 200 and len(r.content) > 0
    detail = f"HTTP {r.status_code}, {len(r.content)} bytes"
    if dl_ok:
        with open(result_path, "wb") as f:
            f.write(r.content)
        try:
            with zipfile.ZipFile(result_path) as z:
                names = z.namelist()
                dl_ok = any("section" in n or "content" in n.lower() for n in names)
                detail += f", zip entries={len(names)}"
        except Exception as e:
            dl_ok = False
            detail += f", zip 오류: {e}"
    check("4. 결과 다운로드 + HWPX 유효성", dl_ok, f"{detail}, {time.time()-t0:.1f}s")
    try:
        from hwpx import HwpxDocument
        doc = HwpxDocument(result_path)
        found = any(EDIT_TEXT in (c.text or "") for t in doc.tables for r_ in t.rows for c in r_.cells)
        check("5. 수정 셀 값 반영", found, f"table0/row0/col0 = '{EDIT_TEXT}'")
    except ImportError:
        check("5. 수정 셀 값 반영", None, "python-hwpx 미설치로 생략")
else:
    check("4. 결과 다운로드 + HWPX 유효성", False, "작업 미완료로 생략")

s_student = requests.Session()
code = login(s_student, "student", "admin1234")
if code == 200 and job_id:
    r = s_student.get(f"{BASE}/api/hwpx/jobs/{job_id}")
    check("6. 타 계정 접근 403", r.status_code == 403, f"HTTP {r.status_code}")
    r2 = s_student.get(f"{BASE}/api/hwpx/jobs/{job_id}/download")
    check("7. 타 계정 다운로드 403", r2.status_code == 403, f"HTTP {r2.status_code}")
else:
    check("6. 타 계정 접근 403", False, "student 로그인 또는 jobId 없음")

print("\n=== 요약 ===", flush=True)
np = sum(1 for _, ok, _ in results if ok is True)
nf = sum(1 for _, ok, _ in results if ok is False)
nsk = sum(1 for _, ok, _ in results if ok is None)
print(f"PASS {np} / FAIL {nf} / SKIP {nsk}", flush=True)
sys.exit(0 if nf == 0 else 1)
