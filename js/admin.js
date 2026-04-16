/**
 * 관리자 DB 관리 패널
 * - 비밀번호 인증
 * - 저장된 위험성평가 CRUD
 * - 기인물 마스터 + SIF 연계 조회
 * - SIF 사고사례 관리
 */
const AdminPanel = (() => {
  const ADMIN_PW = 'wlghks007!';
  let authenticated = false;
  let currentTab = 'assessments';
  let allAssessments = [];

  // ========== 인증 ==========

  function openLogin() {
    const existing = document.getElementById('adminModal');
    if (existing) existing.remove();

    if (authenticated) {
      openPanel();
      return;
    }

    const modal = document.createElement('div');
    modal.id = 'adminModal';
    modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-[200] no-print';
    modal.innerHTML = `
      <div class="bg-white rounded-xl shadow-2xl w-[380px] overflow-hidden">
        <div class="p-4 bg-header-navy text-white">
          <h3 class="font-bold text-center">&#128274; 관리자 로그인</h3>
        </div>
        <div class="p-6">
          <p class="text-sm text-gray-500 mb-4 text-center">데이터베이스 관리 페이지에 접근하려면<br>관리자 비밀번호를 입력하세요.</p>
          <input type="password" id="adminPwInput" placeholder="비밀번호 입력"
            class="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-center tracking-widest focus:ring-2 focus:ring-header-navy focus:border-transparent"
            onkeydown="if(event.key==='Enter') AdminPanel._doLogin()">
          <div id="adminPwError" class="text-red-500 text-xs text-center mt-2 hidden">비밀번호가 올바르지 않습니다.</div>
        </div>
        <div class="p-4 bg-gray-50 border-t flex justify-end gap-2">
          <button onclick="document.getElementById('adminModal').remove()"
            class="px-4 py-2 text-sm border rounded-lg hover:bg-gray-100">취소</button>
          <button onclick="AdminPanel._doLogin()"
            class="px-6 py-2 text-sm bg-header-navy text-white rounded-lg hover:bg-blue-900 font-medium">로그인</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
    setTimeout(() => document.getElementById('adminPwInput')?.focus(), 100);
  }

  function _doLogin() {
    const pw = document.getElementById('adminPwInput').value;
    if (pw === ADMIN_PW) {
      authenticated = true;
      document.getElementById('adminModal').remove();
      openPanel();
    } else {
      const err = document.getElementById('adminPwError');
      err.classList.remove('hidden');
      document.getElementById('adminPwInput').value = '';
      document.getElementById('adminPwInput').focus();
      setTimeout(() => err.classList.add('hidden'), 2000);
    }
  }

  // ========== 메인 패널 ==========

  function openPanel() {
    const existing = document.getElementById('adminModal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'adminModal';
    modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-[200] no-print';
    modal.innerHTML = `
      <div class="bg-white rounded-xl shadow-2xl flex flex-col" style="width:95vw; max-width:1200px; height:90vh;">
        <!-- 헤더 -->
        <div class="p-4 bg-header-navy text-white flex justify-between items-center flex-shrink-0">
          <div class="flex items-center gap-3">
            <h3 class="font-bold">&#128451; 데이터베이스 관리</h3>
            <span class="text-xs text-blue-200">관리자 모드</span>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="AdminPanel._logout()" class="px-3 py-1 text-xs bg-white/20 rounded hover:bg-white/30">로그아웃</button>
            <button onclick="document.getElementById('adminModal').remove()" class="text-white/70 hover:text-white text-xl">&times;</button>
          </div>
        </div>

        <!-- 탭 -->
        <div class="flex border-b bg-gray-50 flex-shrink-0 overflow-x-auto">
          <button onclick="AdminPanel._switchTab('assessments')" class="admin-tab px-4 py-2.5 text-sm font-medium border-b-2 border-header-navy text-header-navy whitespace-nowrap" data-tab="assessments">
            &#128203; 위험성평가 DB
          </button>
          <button onclick="AdminPanel._switchTab('hazards')" class="admin-tab px-4 py-2.5 text-sm text-gray-500 hover:text-gray-700 whitespace-nowrap" data-tab="hazards">
            &#9888; 기인물 마스터 (${HAZARD_MASTER.length}종)
          </button>
          <button onclick="AdminPanel._switchTab('sif')" class="admin-tab px-4 py-2.5 text-sm text-gray-500 hover:text-gray-700 whitespace-nowrap" data-tab="sif">
            &#128680; SIF 사고사례 (${SIF_CASES.length}건)
          </button>
          <button onclick="AdminPanel._switchTab('workers')" class="admin-tab px-4 py-2.5 text-sm text-gray-500 hover:text-gray-700 whitespace-nowrap" data-tab="workers">
            &#128101; 근로자 DB (${WORKER_DB.length}명)
          </button>
          <button onclick="AdminPanel._switchTab('merge')" class="admin-tab px-4 py-2.5 text-sm text-gray-500 hover:text-gray-700 whitespace-nowrap" data-tab="merge">
            &#128279; 기인물-SIF 연계
          </button>
        </div>

        <!-- 콘텐츠 -->
        <div id="adminContent" class="flex-1 overflow-y-auto p-4">
          <!-- 동적 렌더 -->
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });

    _switchTab('assessments');
  }

  function _logout() {
    authenticated = false;
    document.getElementById('adminModal').remove();
    if (typeof App !== 'undefined') App.showToast('관리자 로그아웃', 'info');
  }

  function _switchTab(tab) {
    currentTab = tab;
    document.querySelectorAll('.admin-tab').forEach(el => {
      if (el.dataset.tab === tab) {
        el.classList.add('border-b-2', 'border-header-navy', 'text-header-navy', 'font-medium');
        el.classList.remove('text-gray-500');
      } else {
        el.classList.remove('border-b-2', 'border-header-navy', 'text-header-navy', 'font-medium');
        el.classList.add('text-gray-500');
      }
    });

    const content = document.getElementById('adminContent');
    switch (tab) {
      case 'assessments': renderAssessments(content); break;
      case 'hazards': renderHazards(content); break;
      case 'sif': renderSifCases(content); break;
      case 'workers': renderWorkers(content); break;
      case 'merge': renderMerge(content); break;
    }
  }

  // ========== 탭1: 위험성평가 DB ==========

  let dbSubTab = 'overview'; // 'overview' | 'assessment'

  function renderAssessments(container) {
    container.innerHTML = `
      <div class="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div class="flex items-center gap-3">
          <h4 class="font-bold text-header-navy">위험성평가 데이터베이스</h4>
          <span id="adminAssessCount" class="text-xs text-gray-400">로딩 중...</span>
        </div>
        <div class="flex items-center gap-2 flex-wrap">
          <input type="text" id="adminAssessSearch" placeholder="검색..."
            class="border rounded-lg px-3 py-1.5 text-sm w-36" oninput="AdminPanel._filterAssessments(this.value)">
          <button onclick="AdminPanel._exportAllJSON()" class="px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700">
            &#128229; 내보내기
          </button>
          <button onclick="AdminPanel._importJSON()" class="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            &#128228; 가져오기
          </button>
        </div>
      </div>
      <!-- 서브 탭: 엑셀 시트 구조 -->
      <div class="flex border-b mb-3">
        <button onclick="AdminPanel._setSubTab('overview')" class="db-sub-tab px-4 py-2 text-sm font-medium border-b-2 ${dbSubTab === 'overview' ? 'border-green-600 text-green-700' : 'border-transparent text-gray-500 hover:text-gray-700'}" data-sub="overview">
          &#128203; 작업개요 DB
        </button>
        <button onclick="AdminPanel._setSubTab('assessment')" class="db-sub-tab px-4 py-2 text-sm font-medium border-b-2 ${dbSubTab === 'assessment' ? 'border-green-600 text-green-700' : 'border-transparent text-gray-500 hover:text-gray-700'}" data-sub="assessment">
          &#128202; 위험성평가 DB
        </button>
      </div>
      <div id="dbSubContent"></div>
      <!-- 선택 항목 일괄 작업 -->
      <div id="adminBulkBar" class="hidden mt-3 p-3 bg-yellow-50 border border-yellow-300 rounded-lg flex items-center justify-between">
        <span class="text-sm"><strong id="adminBulkCount">0</strong>건 선택됨</span>
        <button onclick="AdminPanel._deleteSelected()" class="px-3 py-1.5 text-xs bg-red-600 text-white rounded hover:bg-red-700">선택 삭제</button>
      </div>
      <input type="file" id="adminImportFile" class="hidden" accept=".json" onchange="AdminPanel._handleImport(event)">
    `;
    _loadAssessments();
  }

  function _setSubTab(sub) {
    dbSubTab = sub;
    document.querySelectorAll('.db-sub-tab').forEach(el => {
      if (el.dataset.sub === sub) {
        el.classList.add('border-green-600', 'text-green-700');
        el.classList.remove('border-transparent', 'text-gray-500');
      } else {
        el.classList.remove('border-green-600', 'text-green-700');
        el.classList.add('border-transparent', 'text-gray-500');
      }
    });
    const filter = document.getElementById('adminAssessSearch')?.value || '';
    _renderAssessTable(filter);
  }

  let sortKey = 'savedAt';
  let sortAsc = false;

  function _loadAssessments() {
    _openDB().then(db => {
      const tx = db.transaction('assessments', 'readonly');
      const req = tx.objectStore('assessments').getAll();
      req.onsuccess = () => {
        allAssessments = req.result || [];
        _renderAssessTable();
      };
    });
  }

  function _renderAssessTable(filter = '') {
    let list = allAssessments;
    if (filter) {
      const q = filter.toLowerCase();
      list = list.filter(a =>
        (a.key || '').toLowerCase().includes(q) ||
        (a.작업명 || '').toLowerCase().includes(q) ||
        (a.작업내용 || '').toLowerCase().includes(q)
      );
    }

    // 정렬
    list.sort((a, b) => {
      let va = a[sortKey] || '';
      let vb = b[sortKey] || '';
      if (typeof va === 'string') va = va.toLowerCase();
      if (typeof vb === 'string') vb = vb.toLowerCase();
      if (va < vb) return sortAsc ? -1 : 1;
      if (va > vb) return sortAsc ? 1 : -1;
      return 0;
    });

    const countEl = document.getElementById('adminAssessCount');
    if (countEl) countEl.textContent = `총 ${allAssessments.length}건${filter ? ` (검색: ${list.length}건)` : ''}`;

    const subContent = document.getElementById('dbSubContent');
    if (!subContent) return;

    if (dbSubTab === 'overview') {
      _renderOverviewDB(subContent, list);
    } else {
      _renderAssessmentDB(subContent, list);
    }
  }

  /** 작업개요 DB — 엑셀 양식 동일 컬럼 */
  function _renderOverviewDB(container, list) {
    container.innerHTML = `
      <div class="overflow-x-auto">
        <table class="w-full text-xs border-collapse border border-gray-300">
          <thead class="bg-header-green-dark sticky top-0">
            <tr>
              <th class="px-2 py-2 border border-gray-300 w-8"><input type="checkbox" id="adminCheckAll" onchange="AdminPanel._checkAll(this.checked)" class="w-3.5 h-3.5"></th>
              <th class="px-2 py-2 border border-gray-300 cursor-pointer hover:bg-green-200 whitespace-nowrap" onclick="AdminPanel._sortAssess('key')">관리번호 &#8597;</th>
              <th class="px-2 py-2 border border-gray-300 cursor-pointer hover:bg-green-200" onclick="AdminPanel._sortAssess('작업명')">작업명 &#8597;</th>
              <th class="px-2 py-2 border border-gray-300">작업내용</th>
              <th class="px-2 py-2 border border-gray-300 whitespace-nowrap">작업기간</th>
              <th class="px-2 py-2 border border-gray-300">작업장소</th>
              <th class="px-2 py-2 border border-gray-300 whitespace-nowrap">작업분류</th>
              <th class="px-2 py-2 border border-gray-300">중점관리사항</th>
              <th class="px-2 py-2 border border-gray-300">보호구</th>
              <th class="px-2 py-2 border border-gray-300">공기구</th>
              <th class="px-2 py-2 border border-gray-300 whitespace-nowrap">투입중장비</th>
              <th class="px-2 py-2 border border-gray-300 whitespace-nowrap">회사(부서)</th>
              <th class="px-2 py-2 border border-gray-300 whitespace-nowrap">작성일자</th>
              <th class="px-2 py-2 border border-gray-300 whitespace-nowrap">작성자</th>
              <th class="px-2 py-2 border border-gray-300">평가참여자</th>
              <th class="px-2 py-2 border border-gray-300 w-20">작업</th>
            </tr>
          </thead>
          <tbody>
            ${list.length === 0 ? '<tr><td colspan="16" class="text-center py-8 text-gray-400 border">저장된 데이터가 없습니다.</td></tr>' : ''}
            ${list.map(a => {
              const ov = a.overview || {};
              const members = (a.members || []).filter(m => m.name);
              const membersText = members.length <= 3
                ? members.map(m => m.name).join(', ')
                : members.slice(0, 3).map(m => m.name).join(', ') + ` 등 ${members.length}명`;
              const workTypes = _getWorkTypesForItem(a);
              const equipText = _getEquipmentForItem(a);

              return `
                <tr class="border-b hover:bg-blue-50 admin-assess-row" data-key="${a.key}">
                  <td class="px-2 py-1.5 border border-gray-300 text-center"><input type="checkbox" class="admin-check w-3.5 h-3.5" data-key="${a.key}" onchange="AdminPanel._updateBulk()"></td>
                  <td class="px-2 py-1.5 border border-gray-300 font-mono font-medium text-header-navy whitespace-nowrap">${a.key || ''}</td>
                  <td class="px-2 py-1.5 border border-gray-300 font-medium">${a.작업명 || ''}</td>
                  <td class="px-2 py-1.5 border border-gray-300 text-[10px]">${a.작업내용 || ''}</td>
                  <td class="px-2 py-1.5 border border-gray-300 text-[10px] whitespace-nowrap">${ov.작업기간 || ''}</td>
                  <td class="px-2 py-1.5 border border-gray-300 text-[10px]">${ov.작업장소 || ''}</td>
                  <td class="px-2 py-1.5 border border-gray-300 text-[10px]">${workTypes.map(wt => '■ ' + wt).join(' ')}</td>
                  <td class="px-2 py-1.5 border border-gray-300 text-[10px]">${ov.중점관리사항 || ''}</td>
                  <td class="px-2 py-1.5 border border-gray-300 text-[10px]">${ov.필요한보호구 || ''}</td>
                  <td class="px-2 py-1.5 border border-gray-300 text-[10px]">${ov.필요한공기구 || ''}</td>
                  <td class="px-2 py-1.5 border border-gray-300 text-[10px]">${equipText}</td>
                  <td class="px-2 py-1.5 border border-gray-300 text-[10px] whitespace-nowrap">${ov.회사부서명 || ''}</td>
                  <td class="px-2 py-1.5 border border-gray-300 text-[10px] whitespace-nowrap">${ov.작성일자 || ''}</td>
                  <td class="px-2 py-1.5 border border-gray-300 text-[10px] whitespace-nowrap">${ov.작성자 || ''}</td>
                  <td class="px-2 py-1.5 border border-gray-300 text-[10px]">${membersText}</td>
                  <td class="px-2 py-1.5 border border-gray-300 text-center">
                    <div class="flex justify-center gap-0.5">
                      <button onclick="AdminPanel._viewDetail('${a.key}')" class="px-1.5 py-0.5 text-[9px] bg-gray-100 hover:bg-gray-200 rounded" title="상세">&#128269;</button>
                      <button onclick="AdminPanel._loadToEditor('${a.key}')" class="px-1.5 py-0.5 text-[9px] bg-blue-100 hover:bg-blue-200 text-blue-700 rounded" title="로드">&#128221;</button>
                      <button onclick="AdminPanel._deleteOne('${a.key}')" class="px-1.5 py-0.5 text-[9px] bg-red-100 hover:bg-red-200 text-red-700 rounded" title="삭제">&#128465;</button>
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  /** 위험성평가 DB — 엑셀 양식 동일 컬럼 (관리번호 | 공정번호 | 작업단계 | 유해위험요인 | 안전조치 | 가능성 | 중대성 | 위험성) */
  function _renderAssessmentDB(container, list) {
    // 모든 평가의 rows를 펼쳐서 하나의 테이블로
    const allRows = [];
    list.forEach(a => {
      (a.rows || []).forEach(r => {
        allRows.push({ ...r, 관리번호: a.key || a.관리번호, 작업명: a.작업명 });
      });
    });

    container.innerHTML = `
      <div class="mb-2 text-xs text-gray-500">전체 ${list.length}건의 평가에서 총 <strong class="text-header-navy">${allRows.length}행</strong>의 위험성평가 데이터</div>
      <div class="overflow-x-auto">
        <table class="w-full text-xs border-collapse border border-gray-300">
          <thead class="bg-header-navy text-white sticky top-0">
            <tr>
              <th class="px-2 py-2 border border-gray-500 whitespace-nowrap">관리번호</th>
              <th class="px-2 py-2 border border-gray-500 whitespace-nowrap">공정번호</th>
              <th class="px-2 py-2 border border-gray-500 text-left">작업(공정)단계</th>
              <th class="px-2 py-2 border border-gray-500 text-left" style="min-width:200px;">유해위험요인</th>
              <th class="px-2 py-2 border border-gray-500 text-left" style="min-width:200px;">안전조치사항</th>
              <th class="px-2 py-2 border border-gray-500 whitespace-nowrap">가능성<br>(빈도)</th>
              <th class="px-2 py-2 border border-gray-500 whitespace-nowrap">중대성<br>(강도)</th>
              <th class="px-2 py-2 border border-gray-500 whitespace-nowrap">위험성</th>
            </tr>
          </thead>
          <tbody>
            ${allRows.length === 0 ? '<tr><td colspan="8" class="text-center py-8 text-gray-400 border">위험성평가 데이터가 없습니다.</td></tr>' : ''}
            ${allRows.map(r => {
              const rb = (r.freqBefore || 0) * (r.sevBefore || 0);
              const ra = (r.freqAfter || 0) * (r.sevAfter || 0);
              const fa = r.freqAfter || 0;
              const sa = r.sevAfter || 0;
              // 후(전) 형식
              const freqDisp = fa ? `${fa}(${r.freqBefore})` : `(${r.freqBefore || ''})`;
              const sevDisp = sa ? `${sa}(${r.sevBefore})` : `(${r.sevBefore || ''})`;
              const riskDisp = ra ? `${ra}(${rb})` : `(${rb || ''})`;
              const riskStyle = ra >= 12 ? 'background:#C00000;color:white;font-weight:bold;'
                : ra >= 8 ? 'background:#E26B0A;color:white;font-weight:bold;'
                : ra >= 4 ? 'background:#FFC000;font-weight:bold;'
                : ra >= 1 ? 'background:#375623;color:white;' : '';

              return `
                <tr class="border-b hover:bg-blue-50">
                  <td class="px-2 py-1.5 border border-gray-300 font-mono text-[10px] text-center text-header-navy">${r.관리번호}</td>
                  <td class="px-2 py-1.5 border border-gray-300 font-mono text-center">${r.no || ''}</td>
                  <td class="px-2 py-1.5 border border-gray-300">${r.stage || ''}</td>
                  <td class="px-2 py-1.5 border border-gray-300 text-[10px]">${r.hazard || ''}</td>
                  <td class="px-2 py-1.5 border border-gray-300 text-[10px]">${r.safety || ''}</td>
                  <td class="px-2 py-1.5 border border-gray-300 text-center font-mono">${freqDisp}</td>
                  <td class="px-2 py-1.5 border border-gray-300 text-center font-mono">${sevDisp}</td>
                  <td class="px-2 py-1.5 border border-gray-300 text-center font-mono" style="${riskStyle}">${riskDisp}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  /** 해당 assessment의 작업분류 목록 */
  function _getWorkTypesForItem(a) {
    const hazards = a.hazards || [];
    return (a.workTypes || []).filter(t => {
      const autoHit = hazards.some(h => h.checked && h.작업분류 === t.id);
      return autoHit || t.checked;
    }).map(t => t.id);
  }

  /** 해당 assessment의 투입중장비 텍스트 */
  function _getEquipmentForItem(a) {
    const auto = (a.hazards || []).filter(h => h.checked && h.중장비여부 === '중장비').map(h => h.기인물);
    const manual = (a.overview || {}).투입중장비_수동 || '';
    return [...auto, manual].filter(Boolean).join(', ');
  }

  function _sortAssess(key) {
    if (sortKey === key) {
      sortAsc = !sortAsc;
    } else {
      sortKey = key;
      sortAsc = true;
    }
    const filter = document.getElementById('adminAssessSearch')?.value || '';
    _renderAssessTable(filter);
  }

  function _filterAssessments(q) {
    _renderAssessTable(q);
  }

  function _checkAll(checked) {
    document.querySelectorAll('.admin-check').forEach(cb => { cb.checked = checked; });
    _updateBulk();
  }

  function _updateBulk() {
    const checked = document.querySelectorAll('.admin-check:checked');
    const bar = document.getElementById('adminBulkBar');
    const count = document.getElementById('adminBulkCount');
    if (checked.length > 0) {
      bar.classList.remove('hidden');
      count.textContent = checked.length;
    } else {
      bar.classList.add('hidden');
    }
  }

  function _viewDetail(key) {
    const a = allAssessments.find(x => x.key === key);
    if (!a) return;

    const hazards = (a.hazards || []).filter(h => h.checked);
    const rows = a.rows || [];
    const members = (a.members || []).filter(m => m.name);
    const ov = a.overview || {};

    // 기인물별 SIF 매칭 현황
    const sifMerge = hazards.map(h => {
      const cases = getSifCasesByHazard(h.기인물);
      return { name: h.기인물, 작업분류: h.작업분류, 총사고건수: h.총사고건수, sifCount: cases.length, 구분: h.구분 };
    });

    const detailEl = document.createElement('div');
    detailEl.id = 'adminDetail';
    detailEl.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-[250] no-print';
    detailEl.innerHTML = `
      <div class="bg-white rounded-xl shadow-2xl flex flex-col" style="width:90vw; max-width:900px; max-height:85vh;">
        <div class="p-4 bg-header-navy text-white flex justify-between items-center flex-shrink-0">
          <h3 class="font-bold">&#128203; ${a.key} — ${a.작업명 || ''}</h3>
          <button onclick="document.getElementById('adminDetail').remove()" class="text-white/70 hover:text-white text-xl">&times;</button>
        </div>
        <div class="flex-1 overflow-y-auto p-5 space-y-4">
          <!-- 기본 정보 -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div class="p-2 bg-gray-50 rounded border"><div class="text-[10px] text-gray-400">관리번호</div><div class="text-sm font-bold">${a.key}</div></div>
            <div class="p-2 bg-gray-50 rounded border"><div class="text-[10px] text-gray-400">작업명</div><div class="text-sm font-bold">${a.작업명 || '-'}</div></div>
            <div class="p-2 bg-gray-50 rounded border"><div class="text-[10px] text-gray-400">작성일</div><div class="text-sm">${ov.작성일자 || '-'}</div></div>
            <div class="p-2 bg-gray-50 rounded border"><div class="text-[10px] text-gray-400">작업장소</div><div class="text-sm">${ov.작업장소 || '-'}</div></div>
            <div class="p-2 bg-gray-50 rounded border"><div class="text-[10px] text-gray-400">회사/부서</div><div class="text-sm">${ov.회사부서명 || '-'}</div></div>
            <div class="p-2 bg-gray-50 rounded border"><div class="text-[10px] text-gray-400">작업기간</div><div class="text-sm">${ov.작업기간 || '-'}</div></div>
            <div class="p-2 bg-gray-50 rounded border"><div class="text-[10px] text-gray-400">참여자</div><div class="text-sm font-bold">${members.length}명</div></div>
            <div class="p-2 bg-gray-50 rounded border"><div class="text-[10px] text-gray-400">저장일시</div><div class="text-sm">${a.savedAt ? new Date(a.savedAt).toLocaleString('ko-KR') : '-'}</div></div>
          </div>

          <!-- 기인물 + SIF 연계 -->
          <div>
            <h4 class="font-bold text-sm text-risk-vh mb-2">&#9888; 선택 기인물 / SIF 연계 (${hazards.length}개)</h4>
            ${sifMerge.length > 0 ? `
              <table class="w-full text-xs border-collapse">
                <thead class="bg-red-50">
                  <tr>
                    <th class="px-2 py-1.5 text-left border">기인물</th>
                    <th class="px-2 py-1.5 text-center border">작업분류</th>
                    <th class="px-2 py-1.5 text-center border">구분</th>
                    <th class="px-2 py-1.5 text-center border">사고건수</th>
                    <th class="px-2 py-1.5 text-center border">SIF 사례</th>
                    <th class="px-2 py-1.5 text-center border">연계상태</th>
                  </tr>
                </thead>
                <tbody>
                  ${sifMerge.map(m => `
                    <tr class="border-b hover:bg-red-50">
                      <td class="px-2 py-1.5 border font-medium">${m.name}</td>
                      <td class="px-2 py-1.5 border text-center"><span class="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[9px] rounded">${m.작업분류}</span></td>
                      <td class="px-2 py-1.5 border text-center">${m.구분 === '12대기인물' ? '<span class="px-1 py-0.5 bg-red-100 text-risk-vh text-[9px] rounded font-bold">12대</span>' : '-'}</td>
                      <td class="px-2 py-1.5 border text-center font-mono">${m.총사고건수}</td>
                      <td class="px-2 py-1.5 border text-center font-mono">${m.sifCount}건</td>
                      <td class="px-2 py-1.5 border text-center">${m.sifCount > 0 ? '<span class="text-green-600 font-bold">&#10004; Merged</span>' : '<span class="text-gray-400">—</span>'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            ` : '<p class="text-gray-400 text-xs">선택된 기인물 없음</p>'}
          </div>

          <!-- 위험성평가 행 -->
          <div>
            <h4 class="font-bold text-sm text-header-navy mb-2">&#128203; 위험성평가 (${rows.length}건)</h4>
            ${rows.length > 0 ? `
              <div class="overflow-x-auto">
                <table class="w-full text-xs border-collapse">
                  <thead class="bg-gray-100">
                    <tr>
                      <th class="px-2 py-1.5 border text-center w-12">번호</th>
                      <th class="px-2 py-1.5 border text-left">작업단계</th>
                      <th class="px-2 py-1.5 border text-left">유해위험요인</th>
                      <th class="px-2 py-1.5 border text-left">안전조치</th>
                      <th class="px-2 py-1.5 border text-center w-14">위험도(전)</th>
                      <th class="px-2 py-1.5 border text-center w-14">위험도(후)</th>
                      <th class="px-2 py-1.5 border text-center w-10">TBM</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${rows.slice(0, 50).map(r => {
                      const rb = (r.freqBefore||0) * (r.sevBefore||0);
                      const ra = (r.freqAfter||0) * (r.sevAfter||0);
                      return `
                        <tr class="border-b">
                          <td class="px-2 py-1 border text-center font-mono">${r.no || ''}</td>
                          <td class="px-2 py-1 border">${r.stage || ''}</td>
                          <td class="px-2 py-1 border text-[10px]">${r.hazard || ''}</td>
                          <td class="px-2 py-1 border text-[10px]">${r.safety || ''}</td>
                          <td class="px-2 py-1 border text-center font-bold">${rb || '-'}</td>
                          <td class="px-2 py-1 border text-center font-bold text-blue-600">${ra || '-'}</td>
                          <td class="px-2 py-1 border text-center">${r.tbmChk ? '&#10004;' : ''}</td>
                        </tr>
                      `;
                    }).join('')}
                    ${rows.length > 50 ? `<tr><td colspan="7" class="text-center py-2 text-gray-400 border">... 외 ${rows.length - 50}건</td></tr>` : ''}
                  </tbody>
                </table>
              </div>
            ` : '<p class="text-gray-400 text-xs">위험성평가 데이터 없음</p>'}
          </div>

          <!-- 참여자 -->
          <div>
            <h4 class="font-bold text-sm text-header-navy mb-2">&#128101; 참여자 (${members.length}명)</h4>
            <div class="flex flex-wrap gap-1">
              ${members.map(m => `<span class="px-2 py-1 bg-gray-100 border rounded text-xs">${m.affiliation || ''} ${m.name}</span>`).join('')}
            </div>
          </div>
        </div>
        <div class="p-4 bg-gray-50 border-t flex justify-end gap-2 flex-shrink-0">
          <button onclick="AdminPanel._loadToEditor('${a.key}'); document.getElementById('adminDetail').remove();"
            class="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">&#128221; 편집기로 불러오기</button>
          <button onclick="document.getElementById('adminDetail').remove()"
            class="px-4 py-2 text-sm border rounded-lg hover:bg-gray-100">닫기</button>
        </div>
      </div>
    `;
    document.body.appendChild(detailEl);
    detailEl.addEventListener('click', e => { if (e.target === detailEl) detailEl.remove(); });
  }

  function _loadToEditor(key) {
    _openDB().then(db => {
      const tx = db.transaction('assessments', 'readonly');
      const req = tx.objectStore('assessments').get(key);
      req.onsuccess = () => {
        if (!req.result) return;
        const data = req.result;
        document.getElementById('inp-refNo').value = data.관리번호 || '';
        document.getElementById('inp-jobName').value = data.작업명 || '';
        document.getElementById('inp-jobDesc').value = data.작업내용 || '';
        document.querySelectorAll('.overview-input').forEach(input => {
          const field = input.dataset.field;
          if (field && data.overview && data.overview[field]) input.value = data.overview[field];
        });
        Store.importData(data);
        document.getElementById('adminModal')?.remove();
        App.showToast(`"${key}" 편집기로 불러오기 완료!`, 'success');
        StepWizard.goTo(0);
      };
    });
  }

  function _deleteOne(key) {
    if (!confirm(`"${key}" 데이터를 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`)) return;
    _openDB().then(db => {
      const tx = db.transaction('assessments', 'readwrite');
      tx.objectStore('assessments').delete(key);
      tx.oncomplete = () => {
        allAssessments = allAssessments.filter(a => a.key !== key);
        _renderAssessTable(document.getElementById('adminAssessSearch')?.value || '');
        App.showToast(`"${key}" 삭제 완료`, 'info');
      };
    });
  }

  function _deleteSelected() {
    const checks = document.querySelectorAll('.admin-check:checked');
    const keys = [...checks].map(cb => cb.dataset.key);
    if (keys.length === 0) return;
    if (!confirm(`${keys.length}건의 데이터를 삭제하시겠습니까?\n\n${keys.join(', ')}\n\n이 작업은 되돌릴 수 없습니다.`)) return;

    _openDB().then(db => {
      const tx = db.transaction('assessments', 'readwrite');
      const store = tx.objectStore('assessments');
      keys.forEach(key => store.delete(key));
      tx.oncomplete = () => {
        allAssessments = allAssessments.filter(a => !keys.includes(a.key));
        _renderAssessTable(document.getElementById('adminAssessSearch')?.value || '');
        _updateBulk();
        App.showToast(`${keys.length}건 삭제 완료`, 'info');
      };
    });
  }

  function _exportOne(key) {
    const a = allAssessments.find(x => x.key === key);
    if (!a) return;
    const blob = new Blob([JSON.stringify(a, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${key}_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function _exportAllJSON() {
    if (allAssessments.length === 0) return App.showToast('내보낼 데이터가 없습니다.', 'error');
    const blob = new Blob([JSON.stringify(allAssessments, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `위험성평가_전체_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    App.showToast(`${allAssessments.length}건 전체 내보내기 완료`, 'success');
  }

  function _importJSON() {
    document.getElementById('adminImportFile').click();
  }

  function _handleImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        let data = JSON.parse(e.target.result);
        if (!Array.isArray(data)) data = [data];

        _openDB().then(db => {
          const tx = db.transaction('assessments', 'readwrite');
          const store = tx.objectStore('assessments');
          let count = 0;
          data.forEach(item => {
            if (item.key || item.관리번호) {
              if (!item.key) item.key = item.관리번호;
              store.put(item);
              count++;
            }
          });
          tx.oncomplete = () => {
            App.showToast(`${count}건 가져오기 완료`, 'success');
            _loadAssessments();
          };
        });
      } catch (err) {
        App.showToast('JSON 파일 형식이 올바르지 않습니다.', 'error');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  }

  // ========== 탭2: 기인물 마스터 ==========

  function renderHazards(container) {
    const hazards = HAZARD_MASTER;

    container.innerHTML = `
      <div class="flex items-center justify-between mb-4">
        <h4 class="font-bold text-header-navy">기인물 마스터 데이터 (${hazards.length}종)</h4>
        <div class="flex items-center gap-2">
          <input type="text" id="adminHazardSearch" placeholder="기인물 검색..."
            class="border rounded-lg px-3 py-1.5 text-sm w-40" oninput="AdminPanel._filterHazardTable(this.value)">
          <select id="adminHazardFilter" class="border rounded-lg px-3 py-1.5 text-sm" onchange="AdminPanel._filterHazardTable()">
            <option value="">전체 작업분류</option>
            ${WORK_TYPE_ORDER.map(wt => `<option value="${wt}">${wt}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-xs border-collapse">
          <thead class="bg-gray-100 sticky top-0">
            <tr>
              <th class="px-2 py-2 text-center border w-8">순번</th>
              <th class="px-2 py-2 text-left border">기인물</th>
              <th class="px-2 py-2 text-center border">기인물분류</th>
              <th class="px-2 py-2 text-center border">작업분류</th>
              <th class="px-2 py-2 text-center border">구분</th>
              <th class="px-2 py-2 text-center border">사고건수</th>
              <th class="px-2 py-2 text-center border">위험도순위</th>
              <th class="px-2 py-2 text-center border">재해형태</th>
              <th class="px-2 py-2 text-center border">SIF 사례수</th>
              <th class="px-2 py-2 text-center border">SIF 연계</th>
            </tr>
          </thead>
          <tbody id="adminHazardBody">
            ${hazards.map(h => {
              const sifCount = getSifCasesByHazard(h.기인물).length;
              return `
                <tr class="border-b hover:bg-blue-50 admin-hazard-row" data-type="${h.작업분류}" data-name="${h.기인물}">
                  <td class="px-2 py-1.5 border text-center">${h.순번}</td>
                  <td class="px-2 py-1.5 border font-medium">${h.기인물}</td>
                  <td class="px-2 py-1.5 border text-center text-[10px]">${h.기인물분류}</td>
                  <td class="px-2 py-1.5 border text-center"><span class="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[9px] rounded">${h.작업분류}</span></td>
                  <td class="px-2 py-1.5 border text-center">${h.구분 === '12대기인물' ? '<span class="px-1 py-0.5 bg-red-100 text-risk-vh text-[9px] rounded font-bold">12대</span>' : '-'}</td>
                  <td class="px-2 py-1.5 border text-center font-mono font-bold">${h.총사고건수}</td>
                  <td class="px-2 py-1.5 border text-center font-mono">${h.위험도순위}위</td>
                  <td class="px-2 py-1.5 border text-center">${h.다빈도_재해형태}</td>
                  <td class="px-2 py-1.5 border text-center font-mono ${sifCount > 0 ? 'text-green-600 font-bold' : 'text-gray-300'}">${sifCount}건</td>
                  <td class="px-2 py-1.5 border text-center">
                    ${sifCount > 0
                      ? `<button onclick="AdminPanel._showHazardSif('${h.기인물}')" class="px-2 py-0.5 bg-green-100 text-green-700 text-[9px] rounded hover:bg-green-200">&#128279; 조회</button>`
                      : '<span class="text-gray-300 text-[9px]">미연계</span>'}
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function _filterHazardTable(searchVal) {
    const search = (searchVal || document.getElementById('adminHazardSearch')?.value || '').toLowerCase();
    const typeFilter = document.getElementById('adminHazardFilter')?.value || '';

    document.querySelectorAll('.admin-hazard-row').forEach(row => {
      const name = row.dataset.name.toLowerCase();
      const type = row.dataset.type;
      const matchSearch = !search || name.includes(search);
      const matchType = !typeFilter || type === typeFilter;
      row.style.display = (matchSearch && matchType) ? '' : 'none';
    });
  }

  function _showHazardSif(hazardName) {
    const cases = getSifCasesByHazard(hazardName);
    const hazardSuggestions = getSifHazardSuggestions(hazardName);
    const safetySuggestions = getSifSafetySuggestions(hazardName);

    const detailEl = document.createElement('div');
    detailEl.id = 'adminHazardSif';
    detailEl.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-[250] no-print';
    detailEl.innerHTML = `
      <div class="bg-white rounded-xl shadow-2xl flex flex-col" style="width:90vw; max-width:800px; max-height:85vh;">
        <div class="p-4 bg-risk-vh text-white flex justify-between items-center flex-shrink-0">
          <h3 class="font-bold">&#128279; ${hazardName} — SIF 연계 데이터</h3>
          <button onclick="document.getElementById('adminHazardSif').remove()" class="text-white/70 hover:text-white text-xl">&times;</button>
        </div>
        <div class="flex-1 overflow-y-auto p-5 space-y-4">
          <!-- 사고사례 -->
          <div>
            <h4 class="font-bold text-sm text-risk-vh mb-2">&#128680; 사고사례 (${cases.length}건)</h4>
            <div class="space-y-2">
              ${cases.map(c => `
                <div class="p-3 border rounded-lg bg-red-50 text-xs">
                  <div class="flex gap-2 mb-1">
                    <span class="px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded font-bold">${c.재해형태}</span>
                    <span class="text-gray-500">${c.공종} / ${c.작업명}</span>
                  </div>
                  <p class="mb-1"><strong>재해개요:</strong> ${c.재해개요}</p>
                  <p class="text-orange-700"><strong>유발요인:</strong> ${c.재해유발요인}</p>
                  <p class="text-green-700"><strong>감소대책:</strong> ${c.위험성감소대책}</p>
                </div>
              `).join('')}
            </div>
          </div>
          <!-- 추천 위험요인 -->
          <div>
            <h4 class="font-bold text-sm text-orange-700 mb-2">추천 유해위험요인 (${hazardSuggestions.length}건)</h4>
            <div class="flex flex-wrap gap-1">
              ${hazardSuggestions.map(s => `<span class="px-2 py-1 bg-orange-50 border border-orange-200 rounded text-xs">${s.text} <span class="text-orange-400">x${s.count}</span></span>`).join('')}
            </div>
          </div>
          <!-- 추천 안전조치 -->
          <div>
            <h4 class="font-bold text-sm text-green-700 mb-2">추천 안전조치 (${safetySuggestions.length}건)</h4>
            <div class="flex flex-wrap gap-1">
              ${safetySuggestions.map(s => `<span class="px-2 py-1 bg-green-50 border border-green-200 rounded text-xs">${s.text} <span class="text-green-400">x${s.count}</span></span>`).join('')}
            </div>
          </div>
        </div>
        <div class="p-4 bg-gray-50 border-t flex justify-end flex-shrink-0">
          <button onclick="document.getElementById('adminHazardSif').remove()" class="px-4 py-2 text-sm border rounded-lg hover:bg-gray-100">닫기</button>
        </div>
      </div>
    `;
    document.body.appendChild(detailEl);
    detailEl.addEventListener('click', e => { if (e.target === detailEl) detailEl.remove(); });
  }

  // ========== 탭3: SIF 사고사례 ==========

  function renderSifCases(container) {
    const allHazardNames = [...new Set(SIF_CASES.map(c => c.기인물))];

    container.innerHTML = `
      <div class="flex items-center justify-between mb-4">
        <h4 class="font-bold text-header-navy">SIF 사고사례 데이터베이스 (${SIF_CASES.length}건)</h4>
        <div class="flex items-center gap-2">
          <input type="text" id="adminSifSearch" placeholder="키워드 검색..."
            class="border rounded-lg px-3 py-1.5 text-sm w-40" oninput="AdminPanel._filterSifTable()">
          <select id="adminSifHazardFilter" class="border rounded-lg px-3 py-1.5 text-sm" onchange="AdminPanel._filterSifTable()">
            <option value="">전체 기인물</option>
            ${allHazardNames.map(n => `<option value="${n}">${n}</option>`).join('')}
          </select>
          <select id="adminSifTypeFilter" class="border rounded-lg px-3 py-1.5 text-sm" onchange="AdminPanel._filterSifTable()">
            <option value="">전체 재해형태</option>
            ${[...new Set(SIF_CASES.map(c => c.재해형태))].map(t => `<option value="${t}">${t}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-xs border-collapse">
          <thead class="bg-gray-100 sticky top-0">
            <tr>
              <th class="px-2 py-2 text-center border w-8">ID</th>
              <th class="px-2 py-2 text-left border">기인물</th>
              <th class="px-2 py-2 text-center border">공종</th>
              <th class="px-2 py-2 text-left border">작업명</th>
              <th class="px-2 py-2 text-center border">재해형태</th>
              <th class="px-2 py-2 text-left border">재해개요</th>
              <th class="px-2 py-2 text-left border">유발요인</th>
              <th class="px-2 py-2 text-left border">감소대책</th>
            </tr>
          </thead>
          <tbody id="adminSifBody">
            ${SIF_CASES.map(c => `
              <tr class="border-b hover:bg-blue-50 admin-sif-row" data-hazard="${c.기인물}" data-type="${c.재해형태}"
                data-search="${c.기인물} ${c.작업명} ${c.재해개요} ${c.재해유발요인} ${c.위험성감소대책}">
                <td class="px-2 py-1.5 border text-center">${c.id}</td>
                <td class="px-2 py-1.5 border font-medium"><span class="px-1 py-0.5 bg-red-100 text-risk-vh text-[9px] rounded">${c.기인물}</span></td>
                <td class="px-2 py-1.5 border text-center">${c.공종}</td>
                <td class="px-2 py-1.5 border">${c.작업명}</td>
                <td class="px-2 py-1.5 border text-center"><span class="px-1.5 py-0.5 bg-orange-100 text-orange-700 text-[9px] rounded">${c.재해형태}</span></td>
                <td class="px-2 py-1.5 border text-[10px]">${c.재해개요}</td>
                <td class="px-2 py-1.5 border text-[10px] text-orange-700">${c.재해유발요인}</td>
                <td class="px-2 py-1.5 border text-[10px] text-green-700">${c.위험성감소대책}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function _filterSifTable() {
    const search = (document.getElementById('adminSifSearch')?.value || '').toLowerCase();
    const hazardFilter = document.getElementById('adminSifHazardFilter')?.value || '';
    const typeFilter = document.getElementById('adminSifTypeFilter')?.value || '';

    document.querySelectorAll('.admin-sif-row').forEach(row => {
      const matchSearch = !search || row.dataset.search.toLowerCase().includes(search);
      const matchHazard = !hazardFilter || row.dataset.hazard === hazardFilter;
      const matchType = !typeFilter || row.dataset.type === typeFilter;
      row.style.display = (matchSearch && matchHazard && matchType) ? '' : 'none';
    });
  }

  // ========== 탭: 근로자 DB ==========

  function renderWorkers(container) {
    container.innerHTML = `
      <div class="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h4 class="font-bold text-header-navy">근로자 DB · 교육이수 현황 (${WORKER_DB.length}명)</h4>
        <div class="flex items-center gap-2">
          <input type="text" id="adminWorkerSearch" placeholder="이름/소속 검색..."
            class="border rounded-lg px-3 py-1.5 text-sm w-40" oninput="AdminPanel._filterWorkerTable(this.value)">
          <select id="adminWorkerDept" class="border rounded-lg px-3 py-1.5 text-sm" onchange="AdminPanel._filterWorkerTable()">
            <option value="">전체 부서</option>
            ${[...new Set(WORKER_DB.map(w => w.affiliation))].map(d => `<option value="${d}">${d}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-xs border-collapse border border-gray-300">
          <thead class="bg-header-green-dark sticky top-0">
            <tr>
              <th class="px-2 py-2 border border-gray-300 w-10">ID</th>
              <th class="px-2 py-2 border border-gray-300 text-left">성명</th>
              <th class="px-2 py-2 border border-gray-300 text-left">소속</th>
              <th class="px-2 py-2 border border-gray-300 text-center">직위</th>
              <th class="px-1 py-2 border border-gray-300 text-center text-[9px] whitespace-nowrap bg-orange-50">유소견</th>
              <th class="px-1 py-2 border border-gray-300 text-center text-[9px] whitespace-nowrap bg-orange-50">관리감독자<br>확인</th>
              ${EDUCATION_TYPES.map(et => `
                <th class="px-1 py-2 border border-gray-300 text-center text-[9px] whitespace-nowrap">${et.label}</th>
              `).join('')}
            </tr>
          </thead>
          <tbody id="adminWorkerBody">
            ${WORKER_DB.map(w => {
              const h = w.health || {};
              const healthColor = h.status === '적합' ? 'bg-green-50' : h.status === '유소견' ? 'bg-orange-50' : 'bg-red-50';
              const healthIcon = h.status === '적합' ? '<span class="text-green-600 text-[10px]">&#10004; 적합</span>'
                : h.status === '유소견' ? `<span class="text-orange-600 font-bold text-[10px]">&#9888; 유소견</span>${h.note ? '<br><span class="text-[8px] text-orange-500">' + h.note + '</span>' : ''}`
                : '<span class="text-red-500 text-[10px]">&#10007; 미검진</span>';
              const supervisorText = h.supervisor
                ? `<span class="text-green-600 text-[10px]">&#10004;</span><br><span class="text-[8px] text-gray-500">${h.supervisor}</span>${h.date ? '<br><span class="text-[7px] text-gray-400">' + h.date + '</span>' : ''}`
                : '<span class="text-gray-300 text-[10px]">—</span>';
              return `
              <tr class="border-b hover:bg-blue-50 admin-worker-row" data-name="${w.name}" data-dept="${w.affiliation}">
                <td class="px-2 py-1.5 border border-gray-300 text-center font-mono text-[10px]">${w.id}</td>
                <td class="px-2 py-1.5 border border-gray-300 font-medium">${w.name}</td>
                <td class="px-2 py-1.5 border border-gray-300">${w.affiliation}</td>
                <td class="px-2 py-1.5 border border-gray-300 text-center">${w.position || ''}</td>
                <td class="px-1 py-1.5 border border-gray-300 text-center ${healthColor}">${healthIcon}</td>
                <td class="px-1 py-1.5 border border-gray-300 text-center">${supervisorText}</td>
                ${EDUCATION_TYPES.map(et => {
                  const date = w.education[et.id];
                  return `<td class="px-1 py-1.5 border border-gray-300 text-center ${date ? 'bg-green-50' : 'bg-red-50'}">
                    ${date
                      ? `<span class="text-green-700 font-bold text-[10px]">&#10004;</span><br><span class="text-[8px] text-gray-400">${date.slice(5)}</span>`
                      : '<span class="text-red-300 text-[10px]">&#10007;</span>'}
                  </td>`;
                }).join('')}
              </tr>
            `;}).join('')}
          </tbody>
        </table>
      </div>
      <!-- 교육 통계 요약 -->
      <div class="mt-4 grid grid-cols-3 md:grid-cols-5 gap-2">
        ${EDUCATION_TYPES.map(et => {
          const completed = WORKER_DB.filter(w => w.education[et.id]).length;
          const rate = (completed / WORKER_DB.length * 100).toFixed(0);
          return `
            <div class="p-2 border rounded text-center text-xs">
              <div class="font-bold text-[10px] mb-1">${et.label}</div>
              <div class="text-lg font-bold ${+rate >= 80 ? 'text-green-600' : +rate >= 50 ? 'text-orange-500' : 'text-red-500'}">${rate}%</div>
              <div class="text-[9px] text-gray-400">${completed}/${WORKER_DB.length}명</div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  function _filterWorkerTable(searchVal) {
    const search = (searchVal || document.getElementById('adminWorkerSearch')?.value || '').toLowerCase();
    const dept = document.getElementById('adminWorkerDept')?.value || '';
    document.querySelectorAll('.admin-worker-row').forEach(row => {
      const matchSearch = !search || row.dataset.name.toLowerCase().includes(search) || row.dataset.dept.toLowerCase().includes(search);
      const matchDept = !dept || row.dataset.dept === dept;
      row.style.display = (matchSearch && matchDept) ? '' : 'none';
    });
  }

  // ========== 탭4: 기인물-SIF 연계 매트릭스 ==========

  function renderMerge(container) {
    // 기인물별 SIF 연계 현황 매트릭스
    const mergeData = HAZARD_MASTER.map(h => {
      const cases = getSifCasesByHazard(h.기인물);
      const hazardSugg = getSifHazardSuggestions(h.기인물);
      const safetySugg = getSifSafetySuggestions(h.기인물);
      return {
        ...h,
        sifCount: cases.length,
        hazardSuggCount: hazardSugg.length,
        safetySuggCount: safetySugg.length,
        merged: cases.length > 0,
      };
    });

    const mergedCount = mergeData.filter(m => m.merged).length;
    const totalSifLinks = mergeData.reduce((s, m) => s + m.sifCount, 0);

    container.innerHTML = `
      <div class="mb-4">
        <h4 class="font-bold text-header-navy mb-3">기인물 ↔ SIF 사고사례 연계 현황</h4>

        <!-- 연계 통계 -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div class="p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
            <div class="text-2xl font-bold text-header-navy">${HAZARD_MASTER.length}</div>
            <div class="text-xs text-gray-500">기인물 마스터</div>
          </div>
          <div class="p-3 bg-green-50 border border-green-200 rounded-lg text-center">
            <div class="text-2xl font-bold text-green-600">${mergedCount}</div>
            <div class="text-xs text-gray-500">SIF 연계 완료</div>
          </div>
          <div class="p-3 bg-red-50 border border-red-200 rounded-lg text-center">
            <div class="text-2xl font-bold text-risk-vh">${HAZARD_MASTER.length - mergedCount}</div>
            <div class="text-xs text-gray-500">SIF 미연계</div>
          </div>
          <div class="p-3 bg-orange-50 border border-orange-200 rounded-lg text-center">
            <div class="text-2xl font-bold text-risk-h">${totalSifLinks}</div>
            <div class="text-xs text-gray-500">총 SIF 연계 건수</div>
          </div>
        </div>

        <!-- 연계율 프로그레스 -->
        <div class="mb-4 p-3 bg-gray-50 rounded-lg border">
          <div class="flex justify-between text-xs text-gray-500 mb-1">
            <span>SIF 연계율</span>
            <span class="font-bold">${(mergedCount / HAZARD_MASTER.length * 100).toFixed(1)}%</span>
          </div>
          <div class="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div class="h-full bg-green-500 rounded-full" style="width:${(mergedCount / HAZARD_MASTER.length * 100).toFixed(1)}%"></div>
          </div>
        </div>
      </div>

      <!-- 연계 매트릭스 테이블 -->
      <div class="overflow-x-auto">
        <table class="w-full text-xs border-collapse">
          <thead class="bg-gray-100 sticky top-0">
            <tr>
              <th class="px-2 py-2 text-center border w-8">#</th>
              <th class="px-2 py-2 text-left border">기인물</th>
              <th class="px-2 py-2 text-center border">작업분류</th>
              <th class="px-2 py-2 text-center border">사고건수</th>
              <th class="px-2 py-2 text-center border">SIF 사례</th>
              <th class="px-2 py-2 text-center border">추천 위험요인</th>
              <th class="px-2 py-2 text-center border">추천 안전조치</th>
              <th class="px-2 py-2 text-center border">연계상태</th>
              <th class="px-2 py-2 text-center border">상세</th>
            </tr>
          </thead>
          <tbody>
            ${mergeData.map(m => `
              <tr class="border-b hover:bg-blue-50 ${m.merged ? '' : 'bg-red-50/30'}">
                <td class="px-2 py-1.5 border text-center">${m.순번}</td>
                <td class="px-2 py-1.5 border font-medium">
                  ${m.기인물}
                  ${m.구분 === '12대기인물' ? ' <span class="px-1 py-0.5 bg-red-100 text-risk-vh text-[9px] rounded font-bold">12대</span>' : ''}
                </td>
                <td class="px-2 py-1.5 border text-center"><span class="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[9px] rounded">${m.작업분류}</span></td>
                <td class="px-2 py-1.5 border text-center font-mono font-bold">${m.총사고건수}</td>
                <td class="px-2 py-1.5 border text-center font-mono ${m.sifCount > 0 ? 'text-green-600 font-bold' : 'text-gray-300'}">${m.sifCount}건</td>
                <td class="px-2 py-1.5 border text-center font-mono ${m.hazardSuggCount > 0 ? 'text-orange-600' : 'text-gray-300'}">${m.hazardSuggCount}건</td>
                <td class="px-2 py-1.5 border text-center font-mono ${m.safetySuggCount > 0 ? 'text-blue-600' : 'text-gray-300'}">${m.safetySuggCount}건</td>
                <td class="px-2 py-1.5 border text-center">
                  ${m.merged
                    ? '<span class="px-2 py-0.5 bg-green-100 text-green-700 text-[9px] rounded font-bold">&#10004; Merged</span>'
                    : '<span class="px-2 py-0.5 bg-gray-100 text-gray-400 text-[9px] rounded">미연계</span>'}
                </td>
                <td class="px-2 py-1.5 border text-center">
                  ${m.merged
                    ? `<button onclick="AdminPanel._showHazardSif('${m.기인물}')" class="px-2 py-0.5 bg-blue-100 text-blue-700 text-[9px] rounded hover:bg-blue-200">&#128269;</button>`
                    : ''}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  // ========== IndexedDB ==========

  function _openDB() {
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

  return {
    openLogin, openPanel,
    _doLogin, _logout, _switchTab,
    _setSubTab, _filterAssessments, _sortAssess, _checkAll, _updateBulk,
    _viewDetail, _loadToEditor, _deleteOne, _deleteSelected,
    _exportOne, _exportAllJSON, _importJSON, _handleImport,
    _filterHazardTable, _showHazardSif,
    _filterSifTable, _filterWorkerTable,
  };
})();
