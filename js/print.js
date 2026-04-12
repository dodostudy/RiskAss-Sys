/**
 * PDF 인쇄용 붙임서식 7쪽 생성
 * - window.print() 호출 전에 인쇄 전용 컨테이너를 동적 생성
 */
const PrintManager = (() => {
  /**
   * 인쇄 실행
   */
  function print() {
    // 기존 인쇄 컨테이너 제거
    const old = document.getElementById('printContainer');
    if (old) old.remove();

    const container = document.createElement('div');
    container.id = 'printContainer';
    container.className = 'print-only';

    container.innerHTML = [
      page1_작업개요(),
      page2_위험성평가표(),
      page3_감소대책(),
      page4_개선결과(),
      page5_결과확인(),
      page6_TBM1면(),
      page7_TBM2면(),
    ].join('');

    document.body.appendChild(container);
    window.print();
  }

  // === 공통 스타일 ===
  const S = {
    table: 'width:100%; border-collapse:collapse; font-size:9pt;',
    td: 'border:1px solid #000; padding:4px 6px; font-size:9pt;',
    th: 'border:1px solid #000; padding:4px 6px; font-size:9pt; background:#E3F4E3; font-weight:bold;',
    thNavy: 'border:1px solid #000; padding:4px 6px; font-size:9pt; background:#1F3864; color:white; font-weight:bold;',
    title: 'text-align:center; font-size:14pt; font-weight:bold; margin-bottom:12px; font-family:"Noto Serif KR",serif;',
    subtitle: 'font-size:10pt; font-weight:bold; margin:8px 0 4px; border-bottom:2px solid #1F3864; padding-bottom:2px;',
    yellow: 'background:#FFFDE7;',
    gray: 'background:#F3F4F6;',
  };

  function riskColor(v) {
    if (v >= 13) return 'background:#C00000;color:white;font-weight:bold;';
    if (v >= 9) return 'background:#E26B0A;color:white;font-weight:bold;';
    if (v >= 4) return 'background:#FFC000;font-weight:bold;';
    if (v >= 1) return 'background:#375623;color:white;font-weight:bold;';
    return '';
  }

  // === 1쪽: 작업개요 ===
  function page1_작업개요() {
    const ov = Store.get('overview');
    const members = Store.get('members').filter(m => m.name);

    const row = (label, value, style = '') =>
      `<tr><td style="${S.th} width:25%;">${label}</td><td style="${S.td} ${style}">${value || ''}</td></tr>`;

    return `
      <div class="print-page" style="padding:0;">
        <div style="${S.title}">위험성평가 작업개요</div>
        <table style="${S.table}">
          ${row('관리번호', Store.get('관리번호'), S.gray)}
          ${row('작업명', Store.get('작업명'))}
          ${row('작업내용', Store.get('작업내용'))}
          ${row('회사(부서)명', ov.회사부서명)}
          ${row('작성일자', ov.작성일자)}
          ${row('작성자', ov.작성자)}
          ${row('작업기간(시간)', ov.작업기간)}
          ${row('작업장소', ov.작업장소)}
          ${row('작업분류', Store.getWorkTypeText(), S.gray)}
          ${row('중점관리사항', ov.중점관리사항)}
          ${row('필요한 보호구', ov.필요한보호구)}
          ${row('필요한 공기구', ov.필요한공기구)}
          ${row('투입 중장비', Store.getEquipmentText(), S.gray)}
          ${row('평가참여자', Store.getMembersText(), S.gray)}
        </table>

        <div style="${S.subtitle}">SIF 연계 요약</div>
        <table style="${S.table}">
          <tr>
            <td style="${S.th} width:25%;">선택 기인물</td>
            <td style="${S.td}">${Store.getSelectedHazards().map(h => h.기인물).join(', ') || '-'}</td>
          </tr>
          <tr>
            <td style="${S.th}">SIF 기인물 수</td>
            <td style="${S.td}">${Store.getSelectedHazards().length}개</td>
          </tr>
          <tr>
            <td style="${S.th}">총 사고사례 수</td>
            <td style="${S.td}">${Store.getSelectedHazards().reduce((s, h) => s + h.총사고건수, 0).toLocaleString()}건</td>
          </tr>
        </table>
      </div>
    `;
  }

  // === 2쪽: 위험성평가표 ===
  function page2_위험성평가표() {
    const rows = Store.get('rows');
    return `
      <div class="print-page">
        <div style="${S.title}">위험성평가표</div>
        <table style="${S.table}">
          <thead>
            <tr>
              <th style="${S.thNavy} width:40px; text-align:center;">공정<br>번호</th>
              <th style="${S.thNavy} text-align:left;">작업(공정)단계</th>
              <th style="${S.thNavy} text-align:left;">유해위험요인</th>
              <th style="${S.thNavy} text-align:left;">안전조치사항</th>
              <th style="${S.thNavy} width:28px; text-align:center; font-size:7pt;">가능성<br>(전)</th>
              <th style="${S.thNavy} width:28px; text-align:center; font-size:7pt;">중대성<br>(전)</th>
              <th style="${S.thNavy} width:32px; text-align:center; font-size:7pt;">위험도<br>(전)</th>
              <th style="${S.thNavy} width:28px; text-align:center; font-size:7pt;">가능성<br>(후)</th>
              <th style="${S.thNavy} width:28px; text-align:center; font-size:7pt;">중대성<br>(후)</th>
              <th style="${S.thNavy} width:32px; text-align:center; font-size:7pt;">위험성<br>(후)</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map(r => {
              const rb = r.riskBefore || (r.freqBefore || 0) * (r.sevBefore || 0);
              const ra = r.riskAfter || (r.freqAfter || 0) * (r.sevAfter || 0);
              return `
                <tr>
                  <td style="${S.td} text-align:center; font-size:8pt;">${r.no || ''}</td>
                  <td style="${S.td} font-size:8pt;">${r.stage || ''}</td>
                  <td style="${S.td} font-size:8pt;">${r.hazard || ''}</td>
                  <td style="${S.td} font-size:8pt;">${r.safety || ''}</td>
                  <td style="${S.td} text-align:center;">${r.freqBefore || ''}</td>
                  <td style="${S.td} text-align:center;">${r.sevBefore || ''}</td>
                  <td style="${S.td} text-align:center; ${riskColor(rb)}">${rb || ''}</td>
                  <td style="${S.td} text-align:center; color:#0000FF;">${r.freqAfter || ''}</td>
                  <td style="${S.td} text-align:center; color:#0000FF;">${r.sevAfter || ''}</td>
                  <td style="${S.td} text-align:center; ${riskColor(ra)}">${ra || ''}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  // === 3쪽: 감소대책 고려사항 ===
  function page3_감소대책() {
    return `
      <div class="print-page">
        <div style="${S.title}">위험성 감소대책 수립 시 고려사항</div>
        <table style="${S.table}">
          <tr><th style="${S.thNavy}" colspan="2">위험성 감소대책 수립 원칙</th></tr>
          <tr>
            <td style="${S.th} width:30%;">1. 본질적 대책</td>
            <td style="${S.td}">위험한 작업의 폐지·변경, 유해·위험물질 대체 등 설계나 계획 단계에서 위험요인 자체를 제거</td>
          </tr>
          <tr>
            <td style="${S.th}">2. 공학적 대책</td>
            <td style="${S.td}">인터록, 안전장치, 방호울 등 설비적 대책</td>
          </tr>
          <tr>
            <td style="${S.th}">3. 관리적 대책</td>
            <td style="${S.td}">매뉴얼 정비, 출입금지, 노출시간 관리, 교육훈련</td>
          </tr>
          <tr>
            <td style="${S.th}">4. 개인보호구</td>
            <td style="${S.td}">개인보호구의 사용 (최후의 수단)</td>
          </tr>
        </table>

        <div style="${S.subtitle}; margin-top:20px;">위험성 수준별 조치 기준</div>
        <table style="${S.table}">
          <tr>
            <th style="${S.thNavy} width:15%; text-align:center;">등급</th>
            <th style="${S.thNavy} width:15%; text-align:center;">위험도</th>
            <th style="${S.thNavy} text-align:center;">조치 내용</th>
          </tr>
          <tr>
            <td style="${S.td} text-align:center; background:#C00000; color:white; font-weight:bold;">매우위험(VH)</td>
            <td style="${S.td} text-align:center;">13~25</td>
            <td style="${S.td}">즉시 작업중지, 개선 시까지 작업 불가</td>
          </tr>
          <tr>
            <td style="${S.td} text-align:center; background:#E26B0A; color:white; font-weight:bold;">고위험(H)</td>
            <td style="${S.td} text-align:center;">9~12</td>
            <td style="${S.td}">추가 안전조치 후 작업 가능, TBM 시 필수 전달</td>
          </tr>
          <tr>
            <td style="${S.td} text-align:center; background:#FFC000; font-weight:bold;">중위험(M)</td>
            <td style="${S.td} text-align:center;">4~8</td>
            <td style="${S.td}">주의 관찰 필요, 가능한 경감 조치</td>
          </tr>
          <tr>
            <td style="${S.td} text-align:center; background:#375623; color:white; font-weight:bold;">저위험(L)</td>
            <td style="${S.td} text-align:center;">1~3</td>
            <td style="${S.td}">현재 수준 유지</td>
          </tr>
        </table>
      </div>
    `;
  }

  // === 4쪽: 개선결과 ===
  function page4_개선결과() {
    const rows = Store.get('rows').filter(r => r.riskBefore >= 9);
    return `
      <div class="print-page">
        <div style="${S.title}">개선 결과</div>
        <p style="font-size:9pt; margin-bottom:8px;">고위험(위험도 9 이상) 항목의 개선 전/후 비교</p>
        <table style="${S.table}">
          <tr>
            <th style="${S.thNavy} text-align:center; width:40px;">공정</th>
            <th style="${S.thNavy} text-align:left;">유해위험요인</th>
            <th style="${S.thNavy} text-align:left;">안전조치사항</th>
            <th style="${S.thNavy} text-align:center; width:50px;">위험도(전)</th>
            <th style="${S.thNavy} text-align:center; width:50px;">위험성(후)</th>
            <th style="${S.thNavy} text-align:center; width:50px;">개선율</th>
          </tr>
          ${rows.length === 0 ? '<tr><td colspan="6" style="' + S.td + ' text-align:center;">고위험 항목 없음</td></tr>' :
            rows.map(r => {
              const rb = r.riskBefore;
              const ra = r.riskAfter || 0;
              const rate = rb > 0 ? Math.round((rb - ra) / rb * 100) : 0;
              return `
                <tr>
                  <td style="${S.td} text-align:center;">${r.no}</td>
                  <td style="${S.td} font-size:8pt;">${r.hazard || ''}</td>
                  <td style="${S.td} font-size:8pt;">${r.safety || ''}</td>
                  <td style="${S.td} text-align:center; ${riskColor(rb)}">${rb}</td>
                  <td style="${S.td} text-align:center; color:#0000FF; ${riskColor(ra)}">${ra}</td>
                  <td style="${S.td} text-align:center; color:green; font-weight:bold;">${rate > 0 ? `↓${rate}%` : '-'}</td>
                </tr>
              `;
            }).join('')
          }
        </table>
      </div>
    `;
  }

  // === 5쪽: 결과확인 (서명란) ===
  function page5_결과확인() {
    const members = Store.get('members').filter(m => m.name);
    return `
      <div class="print-page">
        <div style="${S.title}">위험성평가 결과확인</div>
        <table style="${S.table}">
          <tr>
            <td style="${S.th} width:25%;">관리번호</td>
            <td style="${S.td}">${Store.get('관리번호')}</td>
            <td style="${S.th} width:25%;">작성일자</td>
            <td style="${S.td}">${Store.get('overview').작성일자}</td>
          </tr>
          <tr>
            <td style="${S.th}">작업명</td>
            <td style="${S.td}" colspan="3">${Store.get('작업명')}</td>
          </tr>
        </table>

        <div style="${S.subtitle}; margin-top:16px;">평가참여자 서명란</div>
        <table style="${S.table}">
          <tr>
            <th style="${S.thNavy} width:40px; text-align:center;">순번</th>
            <th style="${S.thNavy} text-align:center;">소속</th>
            <th style="${S.thNavy} text-align:center;">성명</th>
            <th style="${S.thNavy} text-align:center; width:120px;">서명</th>
          </tr>
          ${members.map((m, i) => `
            <tr style="height:30px;">
              <td style="${S.td} text-align:center;">${i + 1}</td>
              <td style="${S.td} text-align:center;">${m.affiliation}</td>
              <td style="${S.td} text-align:center;">${m.name}</td>
              <td style="${S.td}"></td>
            </tr>
          `).join('')}
          ${members.length < 10 ? Array(10 - members.length).fill(0).map((_, i) => `
            <tr style="height:30px;">
              <td style="${S.td} text-align:center;">${members.length + i + 1}</td>
              <td style="${S.td}"></td><td style="${S.td}"></td><td style="${S.td}"></td>
            </tr>
          `).join('') : ''}
        </table>

        <div style="margin-top:40px; text-align:center;">
          <p style="font-size:10pt;">상기 위험성평가 결과를 확인합니다.</p>
          <p style="font-size:10pt; margin-top:30px;">
            ${Store.get('overview').작성일자 || '____년 __월 __일'}
          </p>
          <p style="font-size:11pt; margin-top:20px;">
            작성자: ${Store.get('overview').작성자 || '________________'} (서명)
          </p>
        </div>
      </div>
    `;
  }

  // === 6쪽: TBM 일지 1면 ===
  function page6_TBM1면() {
    const ov = Store.get('overview');
    const members = Store.get('members').filter(m => m.name);
    const tbm = Store.get('tbm');
    const tbmItems = Store.getTbmRiskItems();
    const details = tbm.attendeeDetails || {};

    const infoRow = (label, value) =>
      `<tr><td style="${S.th} width:22%;">${label}</td><td style="${S.td}">${value || ''}</td></tr>`;

    // 위험예지활동 행 (최소 3행)
    const riskRows = [];
    for (let i = 0; i < Math.max(3, tbmItems.length); i++) {
      const item = tbmItems[i];
      riskRows.push(`
        <tr>
          <td style="${S.td} text-align:center;">${i + 1}</td>
          <td style="${S.td}">${item ? item.hazard : ''}</td>
          <td style="${S.td}">${item ? item.safety : ''}</td>
          <td style="${S.td} text-align:center; width:30px;"></td>
        </tr>
      `);
    }

    return `
      <div class="print-page">
        <div style="${S.title}">TBM (Tool Box Meeting) 일지</div>

        <table style="${S.table}">
          ${infoRow('회사명', ov.회사부서명)}
          ${infoRow('시행일', ov.작성일자)}
          ${infoRow('작업명', Store.get('작업명'))}
          ${infoRow('작업장소', ov.작업장소)}
          ${infoRow('작업시간', ov.작업기간)}
          ${infoRow('투입장비', Store.getEquipmentText())}
          ${infoRow('투입인원', `${members.length}명`)}
          ${infoRow('안전허가', Store.getWorkTypeText())}
          ${infoRow('작업책임자(조장)', ov.작성자)}
        </table>

        <div style="${S.subtitle}; margin-top:10px; color:#C00000;">위험예지활동</div>
        <table style="${S.table}">
          <tr>
            <th style="${S.thNavy} width:30px; text-align:center;">순</th>
            <th style="${S.thNavy} text-align:center;">유해 · 위험요인</th>
            <th style="${S.thNavy} text-align:center;">안전대책</th>
            <th style="${S.thNavy} width:30px; text-align:center;">확인</th>
          </tr>
          ${riskRows.join('')}
        </table>
        ${tbm.onePoint ? `<p style="font-size:9pt; margin-top:4px; color:#C00000;"><strong>One Point:</strong> ${tbm.onePoint}</p>` : ''}

        <div style="${S.subtitle}; margin-top:10px;">참석자 및 건강상태 확인</div>
        <table style="${S.table}">
          <tr>
            <th style="${S.thNavy} width:50px;">소속</th>
            <th style="${S.thNavy} width:50px;">성명</th>
            <th style="${S.thNavy} width:50px;">서명</th>
            <th style="${S.thNavy} width:25px; font-size:7pt;">안전모</th>
            <th style="${S.thNavy} width:25px; font-size:7pt;">안전대</th>
            <th style="${S.thNavy} width:25px; font-size:7pt;">안전화</th>
            <th style="${S.thNavy} width:40px; font-size:7pt;">건강(전)</th>
            <th style="${S.thNavy} width:40px; font-size:7pt;">건강(후)</th>
            <th style="${S.thNavy} width:25px; font-size:7pt;">이상</th>
          </tr>
          ${members.map(m => {
            const d = details[m.name] || {};
            return `
              <tr>
                <td style="${S.td} text-align:center; font-size:8pt;">${m.affiliation}</td>
                <td style="${S.td} text-align:center; font-size:8pt;">${m.name}</td>
                <td style="${S.td}"></td>
                <td style="${S.td} text-align:center;">${d.helmet ? 'O' : ''}</td>
                <td style="${S.td} text-align:center;">${d.safetyBelt ? 'O' : ''}</td>
                <td style="${S.td} text-align:center;">${d.safetyShoes ? 'O' : ''}</td>
                <td style="${S.td} text-align:center; font-size:8pt;">${d.healthBefore || ''}</td>
                <td style="${S.td} text-align:center; font-size:8pt;">${d.healthAfter || ''}</td>
                <td style="${S.td} text-align:center;">${d.abnormal ? 'O' : ''}</td>
              </tr>
            `;
          }).join('')}
        </table>
      </div>
    `;
  }

  // === 7쪽: TBM 일지 2면 ===
  function page7_TBM2면() {
    const tbm = Store.get('tbm');
    const CHECKLIST = [
      '작업 전 안전교육을 실시하였는가?',
      '개인보호구를 정확히 착용하였는가?',
      '작업도구 및 장비 상태를 점검하였는가?',
      '작업장 정리정돈 상태는 양호한가?',
      '안전시설물(난간, 덮개 등)은 설치되었는가?',
      '위험구역 출입통제 조치를 하였는가?',
      '비상연락망 및 응급조치 방법을 숙지하였는가?',
      '작업허가서(안전작업허가)를 발급받았는가?',
    ];

    return `
      <div class="print-page">
        <div style="${S.title}">TBM 일지 (2면)</div>

        <div style="${S.subtitle}">점검 Check List</div>
        <table style="${S.table}">
          <tr>
            <th style="${S.thNavy} text-align:center; width:30px;">No</th>
            <th style="${S.thNavy} text-align:left;">점검 항목</th>
            <th style="${S.thNavy} text-align:center; width:50px;">예</th>
            <th style="${S.thNavy} text-align:center; width:50px;">아니오</th>
          </tr>
          ${CHECKLIST.map((q, i) => {
            const val = tbm.checklist[`q${i + 1}`] || '';
            return `
              <tr>
                <td style="${S.td} text-align:center;">${i + 1}</td>
                <td style="${S.td}">${q}</td>
                <td style="${S.td} text-align:center;">${val === 'yes' ? 'V' : ''}</td>
                <td style="${S.td} text-align:center;">${val === 'no' ? 'V' : ''}</td>
              </tr>
            `;
          }).join('')}
        </table>

        ${tbm.procedure || tbm.safetySheet ? `
          <table style="${S.table}; margin-top:10px;">
            <tr><td style="${S.th} width:30%;">적용 절차서</td><td style="${S.td}">${tbm.procedure || ''}</td></tr>
            <tr><td style="${S.th}">적용 안전점검표</td><td style="${S.td}">${tbm.safetySheet || ''}</td></tr>
          </table>
        ` : ''}

        <table style="${S.table}; margin-top:10px;">
          <tr><td style="${S.th} width:30%;">감시자 안전장구 지급</td><td style="${S.td}">${tbm.safetyGearProvided ? '지급 완료' : '미지급'}</td></tr>
        </table>

        <div style="${S.subtitle}; margin-top:12px;">작업 종료 후 피드백 미팅</div>
        <table style="${S.table}">
          ${(tbm.feedback || ['','','','']).map((f, i) => `
            <tr>
              <td style="${S.th} width:30px; text-align:center;">${i + 1}</td>
              <td style="${S.td}">${f || ''}</td>
            </tr>
          `).join('')}
        </table>

        ${tbm.notes ? `
          <div style="${S.subtitle}; margin-top:10px;">기타 특이사항</div>
          <p style="border:1px solid #000; padding:6px; font-size:9pt; min-height:40px;">${tbm.notes}</p>
        ` : ''}

        <div style="${S.subtitle}; margin-top:12px;">도급인 전달사항</div>
        <table style="${S.table}">
          <tr><td style="${S.th} width:25%;">전달 내용</td><td style="${S.td}">${tbm.contractorMessage?.content || ''}</td></tr>
          <tr><td style="${S.th}">전달일시</td><td style="${S.td}">${tbm.contractorMessage?.deliveredAt || ''}</td></tr>
          <tr><td style="${S.th}">전달자</td><td style="${S.td}">${tbm.contractorMessage?.deliverer || ''}</td></tr>
          <tr><td style="${S.th}">서명</td><td style="${S.td} height:30px;"></td></tr>
        </table>
      </div>
    `;
  }

  return { print };
})();
