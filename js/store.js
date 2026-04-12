/**
 * 중앙 상태관리 Store
 * - 이벤트 기반 구독/발행 패턴
 * - 모든 섹션이 이 store를 통해 데이터를 공유
 */
const Store = (() => {
  // 초기 상태
  const state = {
    // 관리번호/작업 기본정보
    관리번호: '',
    작업명: '',
    작업내용: '',

    // A7: 기인물 체크 리스트 (58개) - data/hazards.js에서 초기화
    hazards: [],

    // H7: 작업분류 10개
    workTypes: [
      { id: '일반작업', kind: 'manual', checked: false, auto: false, note: '' },
      { id: '화기작업', kind: 'manual', checked: false, auto: false, note: '화기감시자 배치 필' },
      { id: '밀폐작업', kind: 'manual', checked: false, auto: false, note: '산소농도측정 필' },
      { id: '고소작업', kind: 'auto', checked: false, auto: false, note: '' },
      { id: '정전작업', kind: 'auto', checked: false, auto: false, note: '' },
      { id: '굴착작업', kind: 'auto', checked: false, auto: false, note: '' },
      { id: '중장비작업', kind: 'auto', checked: false, auto: false, note: '' },
      { id: '중량물작업', kind: 'manual', checked: false, auto: false, note: '중량물작업계획서' },
      { id: '방사선작업', kind: 'manual', checked: false, auto: false, note: '' },
      { id: '잠수작업', kind: 'manual', checked: false, auto: false, note: '' },
    ],

    // H20: 참여자 명단
    members: [],

    // O7: 작업개요
    overview: {
      회사부서명: '',
      작성일자: '',
      작성자: '',
      작업기간: '',
      작업장소: '',
      중점관리사항: '',
      필요한보호구: '',
      필요한공기구: '',
      투입중장비_수동: '',
    },

    // U7: 공정 내용
    processes: [],

    // AB7: 위험성평가 행
    rows: [],

    // TBM 전용 데이터
    tbm: {
      onePoint: '',
      checklist: {},
      feedback: ['', '', '', ''],
      notes: '',
      safetyGearProvided: false,
      contractorMessage: { content: '', deliveredAt: '', deliverer: '', signature: '' },
      attendeeDetails: {},
    },
  };

  // 이벤트 구독자
  const listeners = {};

  /**
   * 상태 가져오기
   */
  function get(key) {
    if (key) return state[key];
    return { ...state };
  }

  /**
   * 상태 업데이트 + 이벤트 발행
   */
  function set(key, value) {
    const old = state[key];
    state[key] = value;
    emit(key, value, old);
  }

  /**
   * 중첩 상태 업데이트 (overview 등)
   */
  function merge(key, partial) {
    if (typeof state[key] === 'object' && !Array.isArray(state[key])) {
      state[key] = { ...state[key], ...partial };
    } else {
      state[key] = partial;
    }
    emit(key, state[key]);
  }

  /**
   * 이벤트 구독
   */
  function on(event, callback) {
    if (!listeners[event]) listeners[event] = [];
    listeners[event].push(callback);
    return () => {
      listeners[event] = listeners[event].filter(cb => cb !== callback);
    };
  }

  /**
   * 이벤트 발행
   */
  function emit(event, data, oldData) {
    (listeners[event] || []).forEach(cb => cb(data, oldData));
    // 와일드카드 리스너
    (listeners['*'] || []).forEach(cb => cb(event, data, oldData));
  }

  // === 파생 데이터 (computed) ===

  /**
   * Z7: 체크된 기인물 목록
   */
  function getSelectedHazards() {
    return state.hazards.filter(h => h.checked);
  }

  /**
   * H7: 작업분류 자동판정 실행
   */
  function classifyWorkTypes() {
    const hazards = state.hazards;
    return state.workTypes.map(t => {
      let autoHit = false;
      if (t.kind === 'auto') {
        switch (t.id) {
          case '고소작업':
            autoHit = hazards.some(h => h.checked && h.고소감전여부 === '고소');
            break;
          case '정전작업':
            autoHit = hazards.some(h => h.checked && h.고소감전여부 === '감전');
            break;
          case '굴착작업':
            autoHit = hazards.some(h => h.checked && h.중장비여부 === '굴착');
            break;
          case '중장비작업':
            autoHit = hazards.some(h => h.checked && h.중장비여부 === '중장비');
            break;
        }
      }
      return {
        ...t,
        auto: autoHit,
        result: (autoHit || t.checked) ? '해당' : '미해당',
      };
    });
  }

  /**
   * 작업분류 텍스트 (■ 표시)
   */
  function getWorkTypeText() {
    return classifyWorkTypes()
      .filter(t => t.result === '해당')
      .map(t => `■ ${t.id}`)
      .join('  ');
  }

  /**
   * 투입 중장비 (체크된 중장비 기인물 + 수동 추가)
   */
  function getEquipmentText() {
    const auto = state.hazards
      .filter(h => h.checked && h.중장비여부 === '중장비')
      .map(h => h.기인물);
    const manual = state.overview.투입중장비_수동;
    const all = [...auto];
    if (manual) all.push(manual);
    return all.join(', ');
  }

  /**
   * 참여자 축약 텍스트
   */
  function getMembersText() {
    const names = state.members.filter(m => m.name);
    if (names.length === 0) return '';
    if (names.length <= 5) return names.map(m => m.name).join(', ');
    return names.slice(0, 5).map(m => m.name).join(', ') + ` 등 총 ${names.length}명`;
  }

  /**
   * 위험성 등급 분류
   */
  function getRiskGrade(risk) {
    if (risk >= 13) return { grade: 'VH', label: '매우위험', color: '#C00000' };
    if (risk >= 9) return { grade: 'H', label: '고위험', color: '#E26B0A' };
    if (risk >= 4) return { grade: 'M', label: '중위험', color: '#FFC000' };
    return { grade: 'L', label: '저위험', color: '#375623' };
  }

  /**
   * 공정별 분석 (AL7)
   */
  function getStageAnalysis() {
    const rows = state.rows;
    const stageNames = [...new Set(rows.map(r => r.stage).filter(Boolean))];
    return stageNames.map(name => {
      const stageRows = rows.filter(r => r.stage === name);
      const risksBefore = stageRows.map(r => r.riskBefore).filter(v => v > 0);
      const risksAfter = stageRows.map(r => r.riskAfter).filter(v => v > 0);
      const avgBefore = risksBefore.length ? +(risksBefore.reduce((a, b) => a + b, 0) / risksBefore.length).toFixed(1) : 0;
      const avgAfter = risksAfter.length ? +(risksAfter.reduce((a, b) => a + b, 0) / risksAfter.length).toFixed(1) : 0;
      const highCount = risksBefore.filter(r => r >= 9).length;
      return {
        name,
        total: stageRows.length,
        highCount,
        avgBefore,
        avgAfter,
        reduction: avgBefore > 0 ? +((avgBefore - avgAfter) / avgBefore).toFixed(3) : 0,
        grade: avgBefore >= 9 ? '고위험' : avgBefore >= 6 ? '중위험' : '저위험',
      };
    });
  }

  /**
   * 등급 분포 (AT7)
   */
  function getRiskDistribution(type = 'before') {
    const key = type === 'before' ? 'riskBefore' : 'riskAfter';
    const values = state.rows.map(r => r[key]).filter(v => v > 0);
    return {
      VH: values.filter(v => v >= 13).length,
      H: values.filter(v => v >= 9 && v < 13).length,
      M: values.filter(v => v >= 4 && v < 9).length,
      L: values.filter(v => v >= 1 && v < 4).length,
      total: values.length,
    };
  }

  /**
   * TBM 위험예지활동 항목 (체크된 행)
   */
  function getTbmRiskItems() {
    return state.rows
      .filter(r => r.tbmChk)
      .map((r, i) => ({
        no: i + 1,
        hazard: r.hazard,
        safety: r.safety,
        source: r.no,
        riskBefore: r.riskBefore,
        confirmed: false,
      }));
  }

  /**
   * 전체 데이터 내보내기 (JSON)
   */
  function exportData() {
    return JSON.parse(JSON.stringify(state));
  }

  /**
   * 전체 데이터 불러오기 (JSON)
   */
  function importData(data) {
    Object.keys(data).forEach(key => {
      if (key in state) {
        state[key] = data[key];
        emit(key, state[key]);
      }
    });
    emit('dataLoaded', state);
  }

  return {
    get, set, merge, on, emit,
    getSelectedHazards,
    classifyWorkTypes,
    getWorkTypeText,
    getEquipmentText,
    getMembersText,
    getRiskGrade,
    getStageAnalysis,
    getRiskDistribution,
    getTbmRiskItems,
    exportData,
    importData,
  };
})();
