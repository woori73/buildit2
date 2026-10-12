/* ============================================================
 * bi-counter.js — GSAP 기반 숫자 카운트업
 * BuildIt 디자인 자산 (anim-gsap-counter)
 * ============================================================
 * - data-bi-count="1250" 속성의 숫자를 스크롤 진입 시 카운트업
 * - 천단위 구분자 지원 (data-bi-format="comma")
 * - 소수점 지원 (data-bi-decimals="1")
 * - 접미사 지원 (data-bi-suffix="명")
 * - prefers-reduced-motion 시 즉시 최종값 표시
 * - 바닐라 JS, 빌드 불필요
 * - GSAP 3.13.0 고정 버전 (CDN)
 * ============================================================ */

(function () {
  'use strict';

  var GSAP_VERSION = '3.13.0';

  function formatNumber(value, decimals, useComma) {
    var fixed = value.toFixed(decimals);
    if (!useComma) {
      return fixed;
    }
    var parts = fixed.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  }

  function showFinalValue(el) {
    var target = parseFloat(el.getAttribute('data-bi-count') || '0', 10);
    var decimals = parseInt(el.getAttribute('data-bi-decimals') || '0', 10);
    var useComma = el.getAttribute('data-bi-format') !== 'plain';
    var suffix = el.getAttribute('data-bi-suffix') || '';
    var prefix = el.getAttribute('data-bi-prefix') || '';
    el.textContent = prefix + formatNumber(target, decimals, useComma) + suffix;
  }

  function init() {
    var counters = document.querySelectorAll('[data-bi-count]');
    if (!counters.length) {
      return;
    }

    // 1. 모션 감소 설정 또는 GSAP 미로드: 즉시 최종값 표시
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || typeof window.gsap === 'undefined') {
      if (typeof window.gsap === 'undefined' && !reduceMotion) {
        console.warn('[bi-counter] GSAP ' + GSAP_VERSION + ' 로드 실패. 최종값을 즉시 표시합니다.');
      }
      counters.forEach(showFinalValue);
      return;
    }

    document.documentElement.classList.add('bi-js-ready');

    // 2. ScrollTrigger 사용 가능 여부
    var useScrollTrigger = typeof window.ScrollTrigger !== 'undefined';
    if (useScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
    }

    counters.forEach(function (el) {
      var target = parseFloat(el.getAttribute('data-bi-count') || '0', 10);
      var decimals = parseInt(el.getAttribute('data-bi-decimals') || '0', 10);
      var useComma = el.getAttribute('data-bi-format') !== 'plain';
      var suffix = el.getAttribute('data-bi-suffix') || '';
      var prefix = el.getAttribute('data-bi-prefix') || '';
      var duration = parseFloat(el.getAttribute('data-bi-duration') || '1.6', 10);

      // 시작 전에는 0 표시
      el.textContent = prefix + formatNumber(0, decimals, useComma) + suffix;

      var state = { value: 0 };

      var tween = gsap.to(state, {
        value: target,
        duration: duration,
        ease: 'power2.out',
        paused: true,
        onUpdate: function () {
          el.textContent = prefix + formatNumber(state.value, decimals, useComma) + suffix;
        },
        onComplete: function () {
          el.textContent = prefix + formatNumber(target, decimals, useComma) + suffix;
        }
      });

      if (useScrollTrigger) {
        // 스크롤 진입 시 한 번만 실행
        ScrollTrigger.create({
          trigger: el,
          start: 'top 90%',
          once: true,
          onEnter: function () {
            tween.play();
          }
        });
      } else {
        // ScrollTrigger 없으면 즉시 실행
        tween.play();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
