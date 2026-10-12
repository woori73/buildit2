/* ============================================================
 * bi-scroll-fade.js — GSAP ScrollTrigger 기반 스크롤 등장
 * BuildIt 디자인 자산 (anim-gsap-scroll-fade)
 * ============================================================
 * - 바닐라 JS, 빌드 불필요
 * - data-bi-reveal 속성이 있는 요소를 스크롤 진입 시 페이드업
 * - GSAP 3.13.0 고정 버전 (CDN)
 * - prefers-reduced-motion 시 즉시 표시 (애니메이션 스킵)
 * ============================================================ */

(function () {
  'use strict';

  var GSAP_VERSION = '3.13.0';

  function init() {
    // 1. 모션 감소 설정: 애니메이션 없이 전부 즉시 표시
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      return; // CSS의 @media 규칙이 이미 즉시 표시 처리
    }

    // 2. GSAP 로드 확인
    if (typeof window.gsap === 'undefined') {
      console.warn('[bi-scroll-fade] GSAP ' + GSAP_VERSION + ' 로드 실패. 요소를 즉시 표시합니다.');
      return;
    }
    if (typeof window.ScrollTrigger === 'undefined') {
      console.warn('[bi-scroll-fade] ScrollTrigger 로드 실패. 요소를 즉시 표시합니다.');
      return;
    }
    gsap.registerPlugin(ScrollTrigger);

    // 3. JS 준비 표시 → CSS가 초기 숨김 상태로 전환
    document.documentElement.classList.add('bi-js-ready');

    // 4. 대상 요소 수집
    var targets = document.querySelectorAll('[data-bi-reveal]');
    if (!targets.length) {
      return;
    }

    // 5. 각 요소에 ScrollTrigger 연결 (once: 한 번만 실행)
    targets.forEach(function (el) {
      var delay = parseFloat(el.getAttribute('data-bi-delay') || '0', 10);
      var direction = el.getAttribute('data-bi-reveal') || 'up';

      // 방향별 시작 위치 (CSS와 일치)
      var fromVars = { opacity: 0, y: 40, x: 0, scale: 1 };
      if (direction === 'left') {
        fromVars = { opacity: 0, y: 0, x: -40, scale: 1 };
      } else if (direction === 'right') {
        fromVars = { opacity: 0, y: 0, x: 40, scale: 1 };
      } else if (direction === 'scale') {
        fromVars = { opacity: 0, y: 0, x: 0, scale: 0.94 };
      }

      gsap.fromTo(
        el,
        fromVars,
        {
          opacity: 1,
          y: 0,
          x: 0,
          scale: 1,
          duration: 0.8,
          delay: delay,
          ease: 'power2.out',
          overwrite: 'auto',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            once: true,
            onEnter: function () {
              el.classList.add('bi-is-visible');
            }
          },
          onComplete: function () {
            el.classList.add('bi-is-visible');
            gsap.set(el, { clearProps: 'transform,opacity,will-change' });
          }
        }
      );
    });

    // 6. 리사이즈 시 ScrollTrigger 새로고침
    var resizeTimer = null;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        ScrollTrigger.refresh();
      }, 200);
    });
  }

  // DOM 준비 후 초기화
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
