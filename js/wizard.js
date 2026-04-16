/**
 * 스텝 위자드 컨트롤러
 * - 섹션을 단계별로 표시/숨김
 * - 진행률 표시
 * - 이전/다음 네비게이션
 */
const StepWizard = (() => {
  const STEPS = [
    { id: 'sec-hazard',     num: 1,  label: '사고사망 고위험 기인물 사용여부', short: '기인물' },
    { id: 'sec-worktype',   num: 2,  label: '작업분류 판정',   short: '작업분류' },
    { id: 'sec-members',    num: 3,  label: '참여자 명단',     short: '참여자' },
    { id: 'sec-overview',   num: 4,  label: '작업개요',        short: '개요' },
    { id: 'sec-process',    num: 5,  label: '공정 내용',       short: '공정' },
    { id: 'sec-assessment', num: 6,  label: '위험성평가',      short: '평가' },
    { id: 'sec-analysis',   num: 7,  label: '공정별 분석',     short: '분석' },
    { id: 'sec-charts',     num: 8,  label: '차트 시각화',     short: '차트' },
    { id: 'sec-tbm',        num: 9,  label: 'TBM 1면',        short: 'TBM①' },
    { id: 'sec-tbm2',       num: 10, label: 'TBM 2면',        short: 'TBM②' },
  ];

  let currentStep = 0; // index into STEPS

  function init() {
    // 모든 스텝 섹션에 wizard-section 클래스 부여
    STEPS.forEach(step => {
      const el = document.getElementById(step.id);
      if (el) {
        el.classList.add('wizard-section');
      }
    });

    // 사이드바 스텝 목록 렌더
    renderStepList();

    // 하단 네비게이션 바 렌더
    renderBottomNav();

    // 첫 번째 스텝 활성화
    goTo(0);
  }

  /**
   * 사이드바 스텝 목록 생성
   */
  function renderStepList() {
    const ul = document.getElementById('stepList');
    if (!ul) return;

    ul.innerHTML = STEPS.map((step, i) => `
      <li class="step-item pending" data-step="${i}" onclick="StepWizard.goTo(${i})">
        <div class="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-50 transition">
          <div class="step-circle w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
            ${step.num}
          </div>
          <span class="step-label text-xs truncate">${step.label}</span>
        </div>
      </li>
    `).join('');
  }

  /**
   * 하단 이전/다음 네비게이션 바
   */
  function renderBottomNav() {
    // 기존 모바일 네비 교체
    const mobileNav = document.querySelector('.mobile-nav');
    if (mobileNav) mobileNav.remove();

    // 하단 고정 네비 생성
    const nav = document.createElement('div');
    nav.id = 'wizardBottomNav';
    nav.className = 'no-print fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-[90]';
    nav.innerHTML = `
      <div class="max-w-[1600px] mx-auto px-4 py-2.5 flex items-center justify-between">
        <button id="wizPrev" onclick="StepWizard.prev()"
          class="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition disabled:opacity-30 disabled:cursor-not-allowed">
          <span>&#9664;</span> 이전
        </button>
        <div class="flex items-center gap-2">
          <span id="wizStepLabel" class="text-sm font-semibold text-header-navy"></span>
          <span class="text-xs text-gray-400">|</span>
          <span id="wizProgress" class="text-xs text-gray-500"></span>
        </div>
        <button id="wizNext" onclick="StepWizard.next()"
          class="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-header-navy rounded-lg hover:bg-blue-900 transition disabled:opacity-30 disabled:cursor-not-allowed">
          다음 <span>&#9654;</span>
        </button>
      </div>
    `;
    document.body.appendChild(nav);

    // main에 하단 여백 추가
    const mainEl = document.querySelector('main');
    if (mainEl) mainEl.style.paddingBottom = '70px';
  }

  /**
   * 특정 스텝으로 이동
   */
  function goTo(index) {
    if (index < 0 || index >= STEPS.length) return;

    currentStep = index;

    // 모든 섹션 숨기고 현재만 표시
    STEPS.forEach((step, i) => {
      const el = document.getElementById(step.id);
      if (!el) return;
      if (i === index) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });

    // 스크롤 맨 위로
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // UI 갱신
    updateStepList();
    updateProgressBar();
    updateBottomNav();
  }

  /**
   * 단계별 필수입력 검증
   */
  function validateStep(stepIndex) {
    const errors = [];

    switch (stepIndex) {
      case 0: // Step 1: 기인물
        if (Store.getSelectedHazards().length === 0) {
          errors.push('기인물을 1개 이상 선택해주세요.');
        }
        break;

      case 1: // Step 2: 작업분류 — 자동판정이므로 검증 불필요
        break;

      case 2: // Step 3: 참여자
        {
          const members = Store.get('members').filter(m => m.name);
          if (members.length === 0) {
            errors.push('참여자를 1명 이상 추가해주세요.');
          }
          const emptyNames = Store.get('members').filter(m => !m.name);
          if (emptyNames.length > 0) {
            errors.push(`성명이 미입력된 참여자가 ${emptyNames.length}명 있습니다.`);
          }
          const roleResult = Store.validateRoles();
          if (!roleResult.valid) {
            roleResult.errors.forEach(e => errors.push(e.message));
          }
        }
        break;

      case 3: // Step 4: 작업개요
        {
          const ov = Store.get('overview');
          const required = [
            { key: '회사부서명', label: '회사(부서)명' },
            { key: '작성일자', label: '작성일자' },
            { key: '작성자', label: '작성자' },
            { key: '작업기간', label: '작업기간(시간)' },
            { key: '작업장소', label: '작업장소' },
          ];
          required.forEach(r => {
            if (!ov[r.key]) errors.push(`${r.label}을(를) 입력해주세요.`);
          });
          if (!Store.get('관리번호')) errors.push('관리번호를 입력해주세요.');
          if (!Store.get('작업명')) errors.push('작업명을 입력해주세요.');
        }
        break;

      case 4: // Step 5: 공정
        {
          const processes = Store.get('processes');
          if (processes.length === 0) {
            errors.push('공정을 1개 이상 추가해주세요.');
          }
          processes.forEach((p, i) => {
            if (!p.stage) errors.push(`공정 ${i + 1}번: 작업단계명을 입력해주세요.`);
            if (!p.content) errors.push(`공정 ${i + 1}번: 작업내용을 입력해주세요.`);
          });
        }
        break;

      case 5: // Step 6: 위험성평가
        {
          const rows = Store.get('rows');
          if (rows.length === 0) {
            errors.push('위험성평가 행을 1건 이상 추가해주세요.');
          }
          rows.forEach((r, i) => {
            if (!r.stage) errors.push(`평가 ${r.no || (i+1)}번: 세부 작업단계를 선택해주세요.`);
            if (!r.hazard) errors.push(`평가 ${r.no || (i+1)}번: 유해위험요인을 입력해주세요.`);
            if (!r.safety) errors.push(`평가 ${r.no || (i+1)}번: 안전조치사항을 입력해주세요.`);
            if (!r.freqBefore || !r.sevBefore) errors.push(`평가 ${r.no || (i+1)}번: 개선 전 가능성/중대성을 입력해주세요.`);
            if (!r.freqAfter || !r.sevAfter) errors.push(`평가 ${r.no || (i+1)}번: 개선 후 가능성/중대성을 입력해주세요.`);
          });
          // 최대 5개 에러만 표시
          if (errors.length > 5) {
            const total = errors.length;
            errors.length = 5;
            errors.push(`... 외 ${total - 5}건의 미입력 항목이 있습니다.`);
          }
        }
        break;

      // Step 7~10은 자동/선택 항목이므로 검증 생략
    }

    return errors;
  }

  function next() {
    // 현재 단계 검증
    const errors = validateStep(currentStep);
    if (errors.length > 0) {
      showValidationPopup(errors);
      return;
    }
    if (currentStep < STEPS.length - 1) goTo(currentStep + 1);
  }

  /**
   * 미입력 항목 팝업 표시
   */
  function showValidationPopup(errors) {
    const existing = document.getElementById('validationPopup');
    if (existing) existing.remove();

    const step = STEPS[currentStep];
    const popup = document.createElement('div');
    popup.id = 'validationPopup';
    popup.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-[200] no-print';
    popup.innerHTML = `
      <div class="bg-white rounded-xl shadow-2xl w-[480px] max-h-[70vh] overflow-hidden">
        <div class="p-4 bg-red-600 text-white flex justify-between items-center">
          <h3 class="font-bold">&#9888; 미입력 항목 안내</h3>
          <button onclick="document.getElementById('validationPopup').remove()" class="text-white/70 hover:text-white text-xl">&times;</button>
        </div>
        <div class="p-5">
          <p class="text-sm font-medium text-gray-700 mb-3">
            <strong>Step ${step.num}. ${step.label}</strong>에 미입력된 항목이 있습니다.
          </p>
          <p class="text-sm text-gray-500 mb-3">아래 항목을 입력 후 다음 단계로 진행해주세요.</p>
          <div class="max-h-[300px] overflow-y-auto space-y-1.5">
            ${errors.map(e => `
              <div class="flex items-start gap-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                <span class="text-red-400 flex-shrink-0 mt-0.5">&#10148;</span>
                <span>${e}</span>
              </div>
            `).join('')}
          </div>
        </div>
        <div class="p-4 bg-gray-50 border-t flex justify-end">
          <button onclick="document.getElementById('validationPopup').remove()"
            class="px-5 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 font-medium transition">
            확인
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(popup);

    // 배경 클릭으로 닫기
    popup.addEventListener('click', (e) => {
      if (e.target === popup) popup.remove();
    });
  }

  function prev() {
    if (currentStep > 0) goTo(currentStep - 1);
  }

  /**
   * 사이드바 스텝 상태 갱신
   */
  function updateStepList() {
    const items = document.querySelectorAll('#stepList .step-item');
    items.forEach((item, i) => {
      item.classList.remove('completed', 'current', 'pending');
      if (i < currentStep) {
        item.classList.add('completed');
      } else if (i === currentStep) {
        item.classList.add('current');
      } else {
        item.classList.add('pending');
      }
    });
  }

  /**
   * 프로그레스 바 갱신
   */
  function updateProgressBar() {
    const pct = Math.round(((currentStep + 1) / STEPS.length) * 100);
    const bar = document.getElementById('sideProgressBar');
    const text = document.getElementById('sideProgressText');
    if (bar) bar.style.width = pct + '%';
    if (text) text.textContent = pct + '%';
  }

  /**
   * 하단 네비 버튼 상태 갱신
   */
  function updateBottomNav() {
    const prevBtn = document.getElementById('wizPrev');
    const nextBtn = document.getElementById('wizNext');
    const label = document.getElementById('wizStepLabel');
    const progress = document.getElementById('wizProgress');

    if (prevBtn) prevBtn.disabled = (currentStep === 0);
    if (nextBtn) {
      if (currentStep === STEPS.length - 1) {
        nextBtn.innerHTML = '완료 <span>&#10003;</span>';
        nextBtn.onclick = () => {
          if (typeof showToast === 'function') showToast('모든 단계 입력 완료! 저장 또는 PDF 출력하세요.', 'success');
        };
      } else {
        nextBtn.innerHTML = '다음 <span>&#9654;</span>';
        nextBtn.onclick = () => StepWizard.next();
      }
    }

    const step = STEPS[currentStep];
    if (label) label.textContent = `Step ${step.num}. ${step.label}`;
    if (progress) progress.textContent = `${currentStep + 1} / ${STEPS.length}`;
  }

  /**
   * 현재 스텝 인덱스 반환
   */
  function getCurrent() {
    return currentStep;
  }

  return { init, goTo, next, prev, getCurrent, STEPS };
})();
