# anim-slide-in-bottom

순수 CSS 슬라이드업 등장 애니메이션. 카드 그리드가 아래에서 위로 순차 등장합니다.

## 사용법

```html
<link rel="stylesheet" href="style.css">

<div class="bi-reveal-grid">
  <article class="bi-card bi-reveal-item">…</article>
  <article class="bi-card bi-reveal-item">…</article>
  <article class="bi-card bi-reveal-item">…</article>
</div>
```

- `.bi-reveal-grid` : 컨테이너 (지속시간·거리·스태거 간격 변수 조정 가능)
- `.bi-reveal-item` : 등장할 요소 (nth-child로 자동 스태거, 최대 9개)
- 9개를 초과하거나 직접 제어하려면 `style="--bi-reveal-index: 12"` 지정
- `.bi-no-stagger` : 지연 없이 즉시 등장

### 변수 조정

```css
.bi-reveal-grid {
  --bi-reveal-duration: 0.7s;   /* 등장 시간 */
  --bi-reveal-easing: cubic-bezier(0.25, 0.46, 0.45, 0.94);
  --bi-reveal-distance: 48px;   /* 시작 위치 (아래) */
  --bi-reveal-stagger: 0.12s;   /* 카드 간 간격 */
}
```

## 특징

- JS 없음, 순수 CSS (~2.3KB)
- GPU 가속: `transform`/`opacity`만 사용 (`translate3d` 포함)
- `prefers-reduced-motion` 설정 시 애니메이션 완전 비활성화 (즉시 표시)

## 영감 출처 및 라이선스 고지

- 영감: Animista `slide-in-bottom` 패턴 (BSD-2-Clause, (c) 2017 Ana Travas, https://animista.net)
- 본 자산의 모든 키프레임·클래스는 BuildIt이 100% 새로 작성한 오리지널 코드이며, Animista 코드를 복사하지 않았습니다.
- Animista 원본의 BSD-2-Clause 라이선스는 원본 코드에만 적용되며, 본 자산은 BuildIt 오리지널 코드입니다.
- 본 자산 사용 시 Animista 저작권 고지를 유지할 의무는 없으나, 위 영감 출처를 README에 기록합니다.

## 파일

- `demo.html` — 독립 실행 데모 (학원 강좌 카드 6종)
- `style.css` — 애니메이션 본체
