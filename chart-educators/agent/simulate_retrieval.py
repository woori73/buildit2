# -*- coding: utf-8 -*-
"""Chart 교육자 지식 DB → 홈페이지 제작 Agent 연결 시뮬레이터 (읽기 전용, 로컬 검증용).

실 운영 파이프라인(AcademyAiContextService → PromptBuilder → WikiRouter → ProposalService)의
Context/Prompt 단계에서 교육자 사례가 어떻게 주입되는지 재현한다. AI API는 호출하지 않으며
프롬프트 문자열 생성까지가 이 테스트의 범위다. (user approval 단계는 운영 Builder가 담당 — 목업 표시)

usage: python simulate_retrieval.py --profile '{"subject":"영어","region":"경기도 구리시","emphasize":"말하기 활동 중심","target":"초등 중등"}'
"""
import json, re, sys, argparse, os

HERE = os.path.dirname(os.path.abspath(__file__))
RET = json.load(open(os.path.join(HERE, "retrievable.json"), encoding="utf-8"))
LINKS = json.load(open(os.path.join(HERE, "..", "mapping", "catalog_links.json"), encoding="utf-8"))

# profile 문구 → classification 태그 사전(운영 이식 시 같은 매핑을 Java side로 옮긴다)
TRIGGER = {
    "말하기": "communication_first", "회화": "communication_first", "발화": "communication_first",
    "암기": "anti_roterism", "정답": "anti_roterism", "실력": "anti_roterism",
    "습관": "habit_structure", "반복": "habit_structure", "시스템": "habit_structure",
    "자기주도": "student_agency", "스스로": "student_agency",
    "소수": "individual_custom", "1:1": "individual_custom", "개별": "individual_custom",
    "원서": "input_output_loop", "파닉스": "input_output_loop", "쉐도잉": "input_output_loop",
    "내신": "results_public", "수능": "results_public", "적중": "results_public",
    "직강": "solo_direct_teaching", "원장": "solo_direct_teaching", "1인": "solo_direct_teaching",
    "학부모": "parent_communication", "상담": "parent_communication",
    "AI": "ai_edsuptech", "프로그램": "named_programs", "체험": "named_programs",
    "지역": "regional_mission", "설명회": "parent_communication", "테스트": "diagnose_placement",
    "레벨": "diagnose_placement", "단계": "stage_pathway", "로드맵": "stage_pathway",
    "교재": "own_materials", "기출": "own_materials", "즐거": "mind_growth", "흥미": "mind_growth",
    "자신감": "mind_growth", "태도": "mind_growth",
}

def search(profile):
    text = " ".join(str(v) for v in profile.values())
    want = {t for kw, t in TRIGGER.items() if kw in text}
    scored = []
    for e in RET["educators"]:
        tag_hits = len(want & set(e["tags"]))
        region = sum([2 if e["province"] in text else 0, 3 if e["region"] in text else 0])
        cardtext = " ".join(" ".join(v) if isinstance(v, list) else v for v in e["card"].values())
        kw_hits = sum(1 for kw in re.split(r"[ ,/]+", text) if len(kw) >= 2 and kw in cardtext)
        score = tag_hits * 3 + region + kw_hits
        if score > 0:
            scored.append((score, e))
    scored.sort(key=lambda x: (-x[0], x[1]["id"]))
    return [e for _, e in scored[:5]]

def recommend_assets(profile, examples):
    # 규칙: 매 example의 태그 → mapping 인덱스 대응(catalog_links.json 순서와 1:1)
    trait_kw = {
        "results_public": 0, "anti_roterism": 1, "solo_direct_teaching": 2, "stage_pathway": 3,
        "habit_structure": 4, "parent_communication": 5, "named_programs": 6,
        "regional_mission": 7, "ai_edsuptech": 8,
    }
    idx = sorted({trait_kw[t] for e in examples for t in e["tags"] if t in trait_kw})
    out = []
    for i in idx:
        m = LINKS["mappings"][i]
        out.append({"trait": m["profile_trait"], "assets": m["recommended_assets"],
                    "section": m["section_suggestion"]})
    return out

def build_prompt_section(examples, limit=3):
    """운영 PromptBuilder에 주입될 [참고 사례] 블록. 인용 금지 규칙 포함."""
    lines = ["[참고 사례 — Chart에 공개된 다른 교육자의 실제 카드(그대로 베끼거나 이 학원의 사실로 쓰지 말 것; "
             "문장 구조·보여주는 방식만 참고)]"]
    for e in examples[:limit]:
        card = e["card"]
        lines.append(f"- (id {e['id']}, {e['region']}, 기준 {e['rankAsOf']}) "
                     + " / ".join(f"{k}: {v[:60]}" for k, v in list(card.items())[:3]))
    lines.append("규칙: 위 사례의 이름·수치·실적·프로그램명을 출력 문구에 포함시키지 않는다. "
                 "의뢰 학원장이 제공한 값만 슬롯에 채운다.")
    return "\n".join(lines)

def mock_apply(examples, assets):
    """ACADEMY_COMPOSE 스타일 proposal 목업 — 사용자 승인 전 상태(적용 없음)."""
    return {
        "diagnosis": f"참조 가능한 실제 운영 사례 {len(examples)}건 대조. 문구 슬롯은 학원장 입력 대기.",
        "proposals": [
            {"id": "p1", "type": "SECTION_ORDER", "target": None,
             # [AI 변경 금지 섹션](sec-curriculum 등)은 이동 대상에서 제외 — 운영 규칙과 동일
             "suggestedValue": ["sec-hero", "sec-philosophy", "sec-intro", "sec-principal",
                                 "sec-lessons", "sec-videos", "sec-social"],
             "based_on_traits": [a["trait"] for a in assets], "status": "PENDING_USER_APPROVAL"},
            {"id": "p2", "type": "TEXT", "target": "philosophyItem1", "suggestedValue": None,
             "note": "의뢰 학원장 철학 문구 입력 후 GUIDE_TEXT로 후보 생성. 참고 사례: id "
                     + ",".join(str(e["id"]) for e in examples)},
        ],
    }

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--profile", default='{"subject":"영어","region":"경기도 구리시","emphasize":"말하기 활동 중심, 암기 반대","target":"초등 중등"}')
    args = ap.parse_args()
    profile = json.loads(args.profile)
    ex = search(profile)
    as_ = recommend_assets(profile, ex)
    print("== 1. 사례 검색 =="); [print(f"  id {e['id']} {e['name']}({e['academyName']}) {e['region']} tags={e['tags'][:5]}") for e in ex]
    print("== 2. 구성/자산 추천 =="); [print(f"  {a['trait']} → {a['assets']}") for a in as_]
    print("== 3. Prompt 주입 블록 =="); print(build_prompt_section(ex))
    print("== 4. 승인 대기 목업 =="); print(json.dumps(mock_apply(ex, as_), ensure_ascii=False, indent=1))

if __name__ == "__main__":
    main()
