# 라이선스 고지

이 저장소의 자산은 각 출처의 라이선스를 따릅니다.

## MIT License

다음 자산에 적용:
- tmpl-open-school (https://github.com/dimartarmizi/open-school-website-template)
- tmpl-demo-school (https://github.com/abneesh/demo_school)
- tmpl-minimal-landing (https://github.com/tailwindtoolbox/Landing-Page)
- comp-hero-hyperui (http://tailkits.com/components/hyperui/)
- comp-team-tailblocks (TailBlocks)
- comp-testimonials-hyperui (http://tailkits.com/components/hyperui/)
- comp-nav-footer-hyperui (http://tailkits.com/components/hyperui/)
- anim-gsap-scroll-fade (예제 코드, https://github.com/boccdotdev/data-reveal)
- anim-gsap-counter (예제 코드, https://github.com/boccdotdev/data-reveal)

```
MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

## BSD 2-Clause License

다음 자산에 적용:
- anim-slide-in-bottom (https://animista.net, (c) 2017 Ana Travas)

```
BSD 2-Clause License

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice,
   this list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.
```

## GSAP Standard License

다음 자산에 적용 (라이브러리 본체):
- anim-gsap-scroll-fade, anim-gsap-counter, anim-gsap-text-mask (참고용)

GSAP는 2025-04-30 정책부터 상업 이용 100% 무료 (SplitText 포함).
오픈소스가 아니며 Webflow 소유. 번들 내 저작권 고지 제거 금지.
**CDN 로드 권장**: https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js

## 주의사항

- 각 자산의 원본 저장소에서 최신 라이선스를 확인하십시오.
- anim-slide-in-bottom: 생성된 CSS의 헤더 주석(저작권 고지)을 유지하십시오.
- 라이선스가 불확실한 자산은 `references/`에 링크만 기록되어 있으며, 코드를 포함하지 않습니다.

## 표기 구분 (2026-10-12 정리)

`catalog/assets.json`의 `license_note` 기준으로, 이 저장소의 자산 코드는 **자체 작성**이고 외부 출처는 **영감(레이아웃·패턴 참고)** 이다. 위 "MIT License" 섹션은 영감 출처의 라이선스와 이 저장소 자산의 재배포 조건을 함께 가리켜 혼동의 여지가 있어, 아래처럼 구분해 읽는다. (법적 확정은 저작권자 확인 후 `ACTIVE` 전환 전에 마친다.)

| 구분 | 의미 |
|---|---|
| 자체 작성 코드 | 이 저장소(BuildIt)가 작성한 HTML/CSS/JS. 외부 코드를 복사하지 않음 |
| 영감 출처 | 패턴만 참고한 외부 프로젝트와 그 라이선스(MIT/BSD-2-Clause 등). 코드 포함 아님 |
| 외부 런타임 의존 | 코드에 포함하지 않고 로드하는 라이브러리(예: GSAP Standard 라이선스 — 도입 시 약관 확인) |

`comp-team-tailblocks`: 자체 작성 코드 / 영감 = TailBlocks team 섹션(MIT) / 외부 의존 없음. 다른 자산의 표기는 후속 정비에서 같은 방식으로 정리한다.
