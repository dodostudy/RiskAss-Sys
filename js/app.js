/**
 * 메인 앱 초기화 + 이벤트 바인딩 + 저장/불러오기
 */
const App = (() => {
  function init() {
    // 기인물 데이터 초기화
    initHazards();

    // 섹션 초기 렌더링
    SectionHazard.render();
    SectionWorkType.render();
    SectionMembers.render();
    SectionOverview.init();
    SectionOverview.render();
    SectionProcess.render();
    SectionAssessment.render();
    SectionAnalysis.render();
    SectionTBM.render();

    // Store 이벤트 → 연쇄 반응 바인딩
    bindReactions();

    // 스텝 위자드 초기화
    StepWizard.init();

    console.log('[App] 위험성평가 · TBM 웹앱 초기화 완료');
  }

  /**
   * 연쇄 반응 바인딩
   * - hazards 변경 → 작업분류 + 공정 드롭다운 + SIF 요약 + 투입중장비 갱신
   * - workTypes 변경 → 작업분류 텍스트 갱신
   * - members 변경 → 참여자 요약 갱신
   * - rows 변경 → 분석 + 차트 갱신
   * - processes 변경 → 위험성평가 드롭다운 갱신
   */
  function bindReactions() {
    // 기인물 변경 → 5단 연쇄 + 차트 갱신
    Store.on('hazards', () => {
      SectionHazard.render();
      SectionWorkType.render();
      SectionProcess.render();
      SectionOverview.render();
      SectionAnalysis.render();
    });

    // 참여자 변경
    Store.on('members', () => {
      SectionMembers.render();
      SectionOverview.render();
      SectionTBM.render();
      SectionAnalysis.render();
    });

    // 위험성평가 행 변경
    Store.on('rows', () => {
      SectionAssessment.render();
      SectionAnalysis.render();
      SectionTBM.render();
    });

    // overview 변경 → TBM 작업정보 갱신
    Store.on('overview', () => {
      SectionOverview.render();
      SectionTBM.render();
    });

    // workTypes 변경 → TBM 안전허가 + 역할 지정 패널 갱신
    Store.on('workTypes', () => {
      SectionWorkType.render();
      SectionMembers.render();
      SectionOverview.render();
      SectionTBM.render();
    });

    // 역할 지정 변경
    Store.on('roleAssignments', () => {
      SectionMembers.render();
    });

    // 데이터 로드 시 TBM 전체 갱신
    Store.on('dataLoaded', () => {
      SectionTBM.render();
    });

    // 공정 변경
    Store.on('processes', () => {
      SectionProcess.render();
      SectionAssessment.render();
    });

    // 관리번호 변경
    Store.on('관리번호', (val) => {
      document.getElementById('headerRefNo').textContent = val || '';
      document.getElementById('ov-refNo').value = val || '';
    });
  }


  // ============ 저장 / 불러오기 / JSON ============

  /**
   * IndexedDB 저장
   */
  function save() {
    const 관리번호 = Store.get('관리번호');
    const 작업명 = Store.get('작업명');
    const rows = Store.get('rows');

    // 유효성 검증
    if (!관리번호) return showToast('관리번호를 입력해주세요.', 'error');
    if (!작업명) return showToast('작업명을 입력해주세요.', 'error');
    if (rows.length === 0) return showToast('위험성평가 1건 이상 필요합니다.', 'error');

    // 필수 역할 검증
    const roleValidation = Store.validateRoles();
    if (!roleValidation.valid) {
      const msgs = roleValidation.errors.map(e => `  - ${e.message}`).join('\n');
      if (!confirm(`필수 역할이 미지정되어 있습니다:\n${msgs}\n\n그래도 저장하시겠습니까?`)) {
        document.getElementById('sec-members').scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }

    const data = Store.exportData();
    data.savedAt = new Date().toISOString();

    openDB().then(db => {
      const tx = db.transaction('assessments', 'readwrite');
      const store = tx.objectStore('assessments');

      const getReq = store.get(관리번호);
      getReq.onsuccess = () => {
        if (getReq.result) {
          if (!confirm(`관리번호 "${관리번호}"가 이미 존재합니다.\n기존 데이터를 덮어쓰시겠습니까?\n\n기존 작업명: ${getReq.result.작업명}\n기존 저장일: ${getReq.result.savedAt}`)) {
            return;
          }
        }
        store.put({ ...data, key: 관리번호 });
        tx.oncomplete = () => {
          const selected = Store.getSelectedHazards();
          showToast(
            `저장 완료!\n작업개요 DB: 1건 ${getReq.result ? '업데이트' : '신규저장'}\n위험성평가 DB: ${rows.length}건 저장\n` +
            `SIF 연계 기인물: ${selected.length}개 포함 (총 ${selected.reduce((s, h) => s + h.총사고건수, 0)}건 사고사례 참조)\n` +
            `관리번호: ${관리번호}`,
            'success'
          );
        };
      };
    });
  }

  /**
   * 불러오기 모달
   */
  function load() {
    openDB().then(db => {
      const tx = db.transaction('assessments', 'readonly');
      const store = tx.objectStore('assessments');
      const req = store.getAll();
      req.onsuccess = () => {
        const list = req.result.sort((a, b) => (b.savedAt || '').localeCompare(a.savedAt || ''));
        showLoadModal(list);
      };
    });
  }

  function showLoadModal(list) {
    const existing = document.getElementById('loadModal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'loadModal';
    modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-[100] no-print';
    modal.innerHTML = `
      <div class="bg-white rounded-xl shadow-2xl w-[600px] max-h-[80vh] overflow-hidden">
        <div class="p-4 bg-header-navy text-white flex justify-between items-center">
          <h3 class="font-bold">저장된 평가 불러오기</h3>
          <button onclick="document.getElementById('loadModal').remove()" class="text-white/70 hover:text-white text-lg">&times;</button>
        </div>
        <div class="p-4">
          <input type="text" id="loadSearch" placeholder="검색 (관리번호, 작업명...)"
            class="w-full border rounded px-3 py-2 text-sm mb-3"
            oninput="App._filterLoadList(this.value)">
          <div id="loadList" class="max-h-[400px] overflow-y-auto space-y-2">
            ${list.length === 0
              ? '<p class="text-center text-gray-400 py-8">저장된 데이터가 없습니다.</p>'
              : list.map(item => `
                <div class="load-item p-3 border rounded-lg hover:bg-blue-50 cursor-pointer transition"
                  data-key="${item.key}" data-search="${item.key} ${item.작업명}"
                  onclick="App._loadItem('${item.key}')">
                  <div class="flex justify-between">
                    <strong class="text-sm">${item.key}</strong>
                    <span class="text-xs text-gray-400">${item.savedAt ? new Date(item.savedAt).toLocaleString('ko-KR') : ''}</span>
                  </div>
                  <p class="text-xs text-gray-500 mt-1">${item.작업명 || ''} | 위험요인 ${(item.rows || []).length}건</p>
                </div>
              `).join('')
            }
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  function _filterLoadList(query) {
    document.querySelectorAll('.load-item').forEach(el => {
      el.style.display = el.dataset.search.includes(query) ? '' : 'none';
    });
  }

  function _loadItem(key) {
    openDB().then(db => {
      const tx = db.transaction('assessments', 'readonly');
      const req = tx.objectStore('assessments').get(key);
      req.onsuccess = () => {
        if (!req.result) return;
        const data = req.result;

        // input 필드 복원
        document.getElementById('inp-refNo').value = data.관리번호 || '';
        document.getElementById('inp-jobName').value = data.작업명 || '';
        document.getElementById('inp-jobDesc').value = data.작업내용 || '';

        // overview input 복원
        document.querySelectorAll('.overview-input').forEach(input => {
          const field = input.dataset.field;
          if (field && data.overview && data.overview[field]) {
            input.value = data.overview[field];
          }
        });

        // Store 데이터 복원
        Store.importData(data);

        // 모달 닫기
        document.getElementById('loadModal').remove();
        showToast(`"${key}" 불러오기 완료!`, 'success');
      };
    });
  }

  /**
   * JSON 내보내기
   */
  function exportJSON() {
    const data = Store.exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.관리번호 || 'risk-assessment'}_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('JSON 파일 다운로드 완료', 'success');
  }

  // ============ IndexedDB ============

  function openDB() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open('RiskAssDB', 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains('assessments')) {
          db.createObjectStore('assessments', { keyPath: 'key' });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  // ============ 토스트 알림 ============

  function showToast(message, type = 'info') {
    const existing = document.getElementById('toast');
    if (existing) existing.remove();

    const colors = {
      success: 'bg-green-600',
      error: 'bg-red-600',
      info: 'bg-blue-600',
    };

    const toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = `fixed bottom-6 right-6 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-xl z-[200] text-sm max-w-md whitespace-pre-line no-print`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = 'opacity 0.5s';
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 500);
    }, 4000);
  }

  // DOM 로드 시 초기화
  document.addEventListener('DOMContentLoaded', init);

  return {
    init, save, load, exportJSON, showToast,
    _filterLoadList, _loadItem,
  };
})();
